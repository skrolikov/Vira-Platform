/**
 * Generated React Hooks for Entities & Permissions
 * 
 * This file is auto-generated from entities.yaml by cmd/codegen.
 * DO NOT EDIT MANUALLY.
 */

import { useMemo } from 'react';
import { PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions } from './permissions';
import { EntityName, ENTITY_CONFIGS } from './entity-types';

// Permission context (you need to implement this in your app)
export interface PermissionContext {
  permissions: string[];
  companyId?: string;
  locationId?: string;
  employeeId?: string;
}

/**
 * Hook to check permissions
 * 
 * Usage:
 *   const { can, canAny, canAll } = usePermissions(userPermissions);
 *   
 *   if (can(PERMISSIONS.USERS_CREATE)) {
 *     // Show create button
 *   }
 */
export function usePermissions(context: PermissionContext) {
  return useMemo(() => ({
    permissions: context.permissions,
    
    can: (permission: string) => hasPermission(context.permissions, permission),
    canAny: (permissions: string[]) => hasAnyPermission(context.permissions, permissions),
    canAll: (permissions: string[]) => hasAllPermissions(context.permissions, permissions),
    
    // Entity-specific helpers
    canView: (entity: EntityName) => {
      const config = ENTITY_CONFIGS[entity];
      if (!config.permissionBase) return true;
      return hasPermission(context.permissions, config.permissionBase + '.view');
    },
    
    canCreate: (entity: EntityName) => {
      const config = ENTITY_CONFIGS[entity];
      if (!config.permissionBase) return true;
      return hasPermission(context.permissions, config.permissionBase + '.create');
    },
    
    canUpdate: (entity: EntityName) => {
      const config = ENTITY_CONFIGS[entity];
      if (!config.permissionBase) return true;
      return hasPermission(context.permissions, config.permissionBase + '.update');
    },
    
    canDelete: (entity: EntityName) => {
      const config = ENTITY_CONFIGS[entity];
      if (!config.permissionBase) return true;
      return hasPermission(context.permissions, config.permissionBase + '.delete');
    },
  }), [context]);
}

/**
 * Hook to get entity CRUD permissions
 * 
 * Usage:
 *   const crud = useEntityCRUD('order', userPermissions);
 *   
 *   if (crud.canCreate) {
 *     // Show create button
 *   }
 */
export function useEntityCRUD(entity: EntityName, context: PermissionContext) {
  return useMemo(() => {
    const config = ENTITY_CONFIGS[entity];
    
    if (!config.permissionBase) {
      return {
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
      };
    }
    
    const base = config.permissionBase;
    const { permissions } = context;
    
    return {
      canView: hasPermission(permissions, base + '.view'),
      canCreate: hasPermission(permissions, base + '.create'),
      canUpdate: hasPermission(permissions, base + '.update'),
      canDelete: hasPermission(permissions, base + '.delete'),
      canManage: hasPermission(permissions, base + '.manage'),
    };
  }, [entity, context]);
}

/**
 * Hook to check if entity is accessible in current context
 * (checks tenancy, location, employee scoping)
 */
export function useEntityAccess(entity: EntityName, context: PermissionContext) {
  return useMemo(() => {
    const config = ENTITY_CONFIGS[entity];
    
    // Check tenancy
    if (config.tenancy === 'tenant' && !context.companyId) {
      return false;
    }
    
    // Check location scoping
    if (config.locationScoped && !context.locationId) {
      return false; // Or true, depending on your business logic
    }
    
    // Check employee scoping
    if (config.employeeScoped && !context.employeeId) {
      return false; // Or true, depending on your business logic
    }
    
    return true;
  }, [entity, context]);
}
