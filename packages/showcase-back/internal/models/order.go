package models

import (
	"time"

	"github.com/google/uuid"
)

type Order struct {
	ID         uuid.UUID  `json:"id" db:"id"`
	ClientName string     `json:"client_name" db:"client_name"`
	Product    string     `json:"product" db:"product"`
	Amount     float64    `json:"amount" db:"amount"`
	Status     string     `json:"status" db:"status"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" db:"updated_at"`
	DeletedAt  *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
}

type CreateOrderRequest struct {
	ClientName string  `json:"client_name" binding:"required"`
	Product    string  `json:"product" binding:"required"`
	Amount     float64 `json:"amount" binding:"required,gt=0"`
}

type UpdateOrderRequest struct {
	ClientName *string  `json:"client_name,omitempty"`
	Product    *string  `json:"product,omitempty"`
	Amount     *float64 `json:"amount,omitempty"`
	Status     *string  `json:"status,omitempty"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=success warning danger new"`
}
