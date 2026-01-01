package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"showcase-back/internal/models"
	"showcase-back/pkg/database"
	"showcase-back/pkg/kafka"
	"time"

	"github.com/google/uuid"
)

type OrderService struct{}

func NewOrderService() *OrderService {
	return &OrderService{}
}

func (s *OrderService) Create(ctx context.Context, req models.CreateOrderRequest) (*models.Order, error) {
	order := &models.Order{
		ID:        uuid.New(),
		ClientName: req.ClientName,
		Product:   req.Product,
		Amount:    req.Amount,
		Status:    "new",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	query := `
		INSERT INTO orders (id, client_name, product, amount, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, client_name, product, amount, status, created_at, updated_at, deleted_at
	`

	err := database.DB.QueryRowContext(ctx, query,
		order.ID, order.ClientName, order.Product, order.Amount, order.Status,
		order.CreatedAt, order.UpdatedAt,
	).Scan(
		&order.ID, &order.ClientName, &order.Product, &order.Amount,
		&order.Status, &order.CreatedAt, &order.UpdatedAt, &order.DeletedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	// Публикация события в Kafka
	event := kafka.Event{
		Type:    "order.created",
		Payload: order,
	}
	if err := kafka.PublishEvent("orders", event); err != nil {
		log.Printf("⚠️ Failed to publish order.created event: %v", err)
	}

	return order, nil
}

func (s *OrderService) GetAll(ctx context.Context, includeDeleted bool) ([]models.Order, error) {
	query := `
		SELECT id, client_name, product, amount, status, created_at, updated_at, deleted_at
		FROM orders
	`
	
	if !includeDeleted {
		query += " WHERE deleted_at IS NULL"
	}
	
	query += " ORDER BY created_at DESC"

	rows, err := database.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query orders: %w", err)
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var order models.Order
		err := rows.Scan(
			&order.ID, &order.ClientName, &order.Product, &order.Amount,
			&order.Status, &order.CreatedAt, &order.UpdatedAt, &order.DeletedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}
		orders = append(orders, order)
	}

	return orders, nil
}

func (s *OrderService) GetByID(ctx context.Context, id uuid.UUID) (*models.Order, error) {
	order := &models.Order{}
	query := `
		SELECT id, client_name, product, amount, status, created_at, updated_at, deleted_at
		FROM orders
		WHERE id = $1 AND deleted_at IS NULL
	`

	err := database.DB.QueryRowContext(ctx, query, id).Scan(
		&order.ID, &order.ClientName, &order.Product, &order.Amount,
		&order.Status, &order.CreatedAt, &order.UpdatedAt, &order.DeletedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get order: %w", err)
	}

	return order, nil
}

func (s *OrderService) Update(ctx context.Context, id uuid.UUID, req models.UpdateOrderRequest) (*models.Order, error) {
	// Получаем текущий заказ
	order, err := s.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Обновляем поля
	if req.ClientName != nil {
		order.ClientName = *req.ClientName
	}
	if req.Product != nil {
		order.Product = *req.Product
	}
	if req.Amount != nil {
		order.Amount = *req.Amount
	}
	if req.Status != nil {
		order.Status = *req.Status
	}
	order.UpdatedAt = time.Now()

	query := `
		UPDATE orders
		SET client_name = $1, product = $2, amount = $3, status = $4, updated_at = $5
		WHERE id = $6 AND deleted_at IS NULL
		RETURNING id, client_name, product, amount, status, created_at, updated_at, deleted_at
	`

	err = database.DB.QueryRowContext(ctx, query,
		order.ClientName, order.Product, order.Amount, order.Status,
		order.UpdatedAt, id,
	).Scan(
		&order.ID, &order.ClientName, &order.Product, &order.Amount,
		&order.Status, &order.CreatedAt, &order.UpdatedAt, &order.DeletedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to update order: %w", err)
	}

	// Публикация события
	event := kafka.Event{
		Type:    "order.updated",
		Payload: order,
	}
	if err := kafka.PublishEvent("orders", event); err != nil {
		log.Printf("⚠️ Failed to publish order.updated event: %v", err)
	}

	return order, nil
}

func (s *OrderService) UpdateStatus(ctx context.Context, id uuid.UUID, status string) (*models.Order, error) {
	order, err := s.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	order.Status = status
	order.UpdatedAt = time.Now()

	query := `
		UPDATE orders
		SET status = $1, updated_at = $2
		WHERE id = $3 AND deleted_at IS NULL
		RETURNING id, client_name, product, amount, status, created_at, updated_at, deleted_at
	`

	err = database.DB.QueryRowContext(ctx, query, status, order.UpdatedAt, id).Scan(
		&order.ID, &order.ClientName, &order.Product, &order.Amount,
		&order.Status, &order.CreatedAt, &order.UpdatedAt, &order.DeletedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to update order status: %w", err)
	}

	// Публикация события изменения статуса
	eventPayload, _ := json.Marshal(map[string]interface{}{
		"order_id": id,
		"old_status": order.Status, // В реальности нужно хранить старое значение
		"new_status": status,
	})
	event := kafka.Event{
		Type:    "order.status_changed",
		Payload: json.RawMessage(eventPayload),
	}
	if err := kafka.PublishEvent("orders", event); err != nil {
		log.Printf("⚠️ Failed to publish order.status_changed event: %v", err)
	}

	return order, nil
}

func (s *OrderService) Delete(ctx context.Context, id uuid.UUID) error {
	now := time.Now()
	query := `
		UPDATE orders
		SET deleted_at = $1, updated_at = $1
		WHERE id = $2 AND deleted_at IS NULL
	`

	result, err := database.DB.ExecContext(ctx, query, now, id)
	if err != nil {
		return fmt.Errorf("failed to delete order: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("order not found or already deleted")
	}

	// Публикация события
	eventPayload, _ := json.Marshal(map[string]interface{}{
		"order_id": id,
	})
	event := kafka.Event{
		Type:    "order.deleted",
		Payload: json.RawMessage(eventPayload),
	}
	if err := kafka.PublishEvent("orders", event); err != nil {
		log.Printf("⚠️ Failed to publish order.deleted event: %v", err)
	}

	return nil
}

func (s *OrderService) Restore(ctx context.Context, id uuid.UUID) (*models.Order, error) {
	query := `
		UPDATE orders
		SET deleted_at = NULL, updated_at = $1
		WHERE id = $2 AND deleted_at IS NOT NULL
		RETURNING id, client_name, product, amount, status, created_at, updated_at, deleted_at
	`

	order := &models.Order{}
	now := time.Now()
	err := database.DB.QueryRowContext(ctx, query, now, id).Scan(
		&order.ID, &order.ClientName, &order.Product, &order.Amount,
		&order.Status, &order.CreatedAt, &order.UpdatedAt, &order.DeletedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to restore order: %w", err)
	}

	// Публикация события
	event := kafka.Event{
		Type:    "order.restored",
		Payload: order,
	}
	if err := kafka.PublishEvent("orders", event); err != nil {
		log.Printf("⚠️ Failed to publish order.restored event: %v", err)
	}

	return order, nil
}

