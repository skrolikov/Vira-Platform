/**
 * Entity Module System - Plug & Play модули для сущностей
 * Каждая сущность = сервис + модель + форма + таблица
 */

import { defineModel, type ModelDefinition } from "./models";
import { createService } from "./services";
import type { ServiceFactory } from "./types";
import { createRestClient, rest } from "./rest";

export interface EntityModuleConfig<T = any> {
  name: string;
  model: ModelDefinition;
  serviceFactory: ServiceFactory<T>;
  restEndpoint?: string;
  formConfig?: {
    layout?: "vertical" | "horizontal" | "grid";
    columns?: number;
  };
  tableConfig?: {
    columns: any[]; // TableColumn[]
    searchable?: boolean;
    selectable?: boolean;
  };
}

/**
 * Создание полного модуля сущности
 */
export function createEntityModule<T extends Record<string, any>>(
  config: EntityModuleConfig<T>
): {
  model: () => any;
  service: T;
  formProps: any;
  tableProps: any;
  restResource: any;
} {
  const { name, model: modelDef, serviceFactory, restEndpoint, formConfig, tableConfig } = config;

  // Создаём модель
  const model = defineModel(modelDef);

  // Создаём сервис
  createService(name, serviceFactory);
  const service = serviceFactory();

  // REST ресурс (если указан endpoint)
  const restResource = restEndpoint ? rest<T>(restEndpoint) : null;

  // Props для формы
  const formProps = {
    service: `${name}Form`,
    model,
    ...formConfig,
  };

  // Props для таблицы
  const tableProps = {
    source: `${name}.list`,
    columns: tableConfig?.columns || [],
    searchable: tableConfig?.searchable ?? true,
    selectable: tableConfig?.selectable ?? false,
  };

  return {
    model,
    service: service as T,
    formProps,
    tableProps,
    restResource: restResource as any,
  };
}

/**
 * Регистрация модуля формы
 */
export function registerFormService(
  entityName: string,
  model: ModelDefinition
): void {
  const formModel = defineModel(model);
  
  class FormService {
    private _model = formModel();
    
    get model() {
      return this._model;
    }

    async submit() {
      if (!this._model.validate()) {
        console.error("Validation errors:", this._model.errors);
        return false;
      }

      try {
        const entityService = (require("./services").useService as any)(entityName);
        if (typeof entityService.create === "function") {
          await entityService.create(this._model.toJSON());
          this._model.reset();
          return true;
        }
      } catch (error) {
        console.error("Submit failed:", error);
        return false;
      }

      return false;
    }
  }

  createService(`${entityName}Form`, () => new FormService());
}

/**
 * Быстрое создание CRUD модуля
 */
export function createCRUDModule<T extends Record<string, any>>(config: {
  name: string;
  model: ModelDefinition;
  restEndpoint: string;
  tableColumns: any[];
}): {
  model: () => any;
  formProps: any;
  tableProps: any;
} {
  // Регистрируем форму
  registerFormService(config.name, config.model);

  // Создаём сервис сущности
  class EntityService {
    private _list: T[] = [];
    private _search: string = "";

    get list(): T[] {
      let filtered = this._list;

      if (this._search) {
        const searchLower = this._search.toLowerCase();
        filtered = filtered.filter((item: any) =>
          Object.values(item).some((val: any) =>
            String(val).toLowerCase().includes(searchLower)
          )
        );
      }

      return filtered;
    }

    get search(): string {
      return this._search;
    }

    setSearch(value: string) {
      this._search = value;
    }

    async fetch() {
      try {
        const response = await rest<T>(config.restEndpoint).list();
        this._list = response.data || [];
      } catch (error) {
        console.error(`Failed to fetch ${config.name}:`, error);
        this._list = [];
      }
    }

    async create(data: Partial<T>) {
      try {
        const response = await rest<T>(config.restEndpoint).create(data);
        this._list.push(response);
      } catch (error) {
        console.error(`Failed to create ${config.name}:`, error);
      }
    }

    async update(id: string | number, data: Partial<T>) {
      try {
        const updated = await rest<T>(config.restEndpoint).update(id, data);
        this._list = this._list.map((item: any) =>
          item.id === id ? { ...item, ...updated } : item
        );
      } catch (error) {
        console.error(`Failed to update ${config.name}:`, error);
      }
    }

    async delete(id: string | number) {
      try {
        await rest(config.restEndpoint).delete(id);
        this._list = this._list.filter((item: any) => item.id !== id);
      } catch (error) {
        console.error(`Failed to delete ${config.name}:`, error);
      }
    }
  }

  createService(config.name, () => new EntityService());

  const model = defineModel(config.model);

  return {
    model,
    formProps: {
      service: `${config.name}Form`,
      model,
      layout: "grid",
      columns: 2,
    },
    tableProps: {
      source: `${config.name}.list`,
      columns: config.tableColumns,
      searchable: true,
      selectable: true,
    },
  };
}

