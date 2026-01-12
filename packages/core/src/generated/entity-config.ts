/**
 * Entity Configuration & Menu Mappings
 * 
 * This file is auto-generated from entities.yaml by cmd/codegen.
 * DO NOT EDIT MANUALLY.
 */

import { PERMISSIONS } from './permissions';
import { EntityName, ENTITY_NAMES } from './entity-types';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  entity?: EntityName;
  permission?: string;
  children?: MenuItem[];
}

// Entity → Menu label mapping (can be customized)
export const ENTITY_LABELS: Partial<Record<EntityName, string>> = {
  // Customize these labels as needed
  'adexpense': 'Adexpense',
  'adsource': 'Adsource',
  'advertisingcampaign': 'Advertisingcampaign',
  'advertisingexpense': 'Advertisingexpense',
  'analyticscustomeractivity': 'Analyticscustomeractivity',
  'analyticsdailyfinance': 'Analyticsdailyfinance',
  'analyticsdailyinventory': 'Analyticsdailyinventory',
  'analyticsdailyorder': 'Analyticsdailyorder',
  'analyticsdailysale': 'Analyticsdailysale',
  'analyticsemployeeperformance': 'Analyticsemployeeperformance',
  'analyticsrealtimemetric': 'Analyticsrealtimemetric',
  'analyticsrefund': 'Analyticsrefund',
  'analyticsservicesale': 'Analyticsservicesale',
  'analyticssupplychain': 'Analyticssupplychain',
  'dailyanalytic': 'Dailyanalytic',
  'apikey': 'Apikey',
  'auditlog': 'Auditlog',
  'automationrule': 'Automationrule',
  'brand': 'Brand',
  'call': 'Call',
  'callrecording': 'Callrecording',
  'campaign': 'Campaign',
  'campaignrecipient': 'Campaignrecipient',
  'cashbox': 'Cashbox',
  'cashiershift': 'Cashiershift',
  'cashregisterhistory': 'Cashregisterhistory',
  'cashregistertransaction': 'Cashregistertransaction',
  'category': 'Category',
  'chat': 'Chat',
  'chatintegration': 'Chatintegration',
  'chatparticipant': 'Chatparticipant',
  'chattemplate': 'Chattemplate',
  'chatwebhook': 'Chatwebhook',
  'companie': 'Companie',
  'contact': 'Contact',
  'contactevent': 'Contactevent',
  'customer': 'Customer',
  'customerbalancehistory': 'Customerbalancehistory',
  'customerdevice': 'Customerdevice',
  'customerregistrationtoken': 'Customerregistrationtoken',
  'devicemodel': 'Devicemodel',
  'devicetype': 'Devicetype',
  'discount': 'Discount',
  'document': 'Document',
  'documentprint': 'Documentprint',
  'documenttemplate': 'Documenttemplate',
  'documenttype': 'Documenttype',
  'employee': 'Employee',
  'employeeperformance': 'Employeeperformance',
  'employeesetting': 'Employeesetting',
  'eventlog': 'Eventlog',
  'eventtype': 'Eventtype',
  'eventtypescatalog': 'Eventtypescatalog',
  'financialtransaction': 'Financialtransaction',
  'moneymovement': 'Moneymovement',
  'funnelstage': 'Funnelstage',
  'inventoryitem': 'Inventoryitem',
  'inventorymovement': 'Inventorymovement',
  'issue': 'Issue',
  'kkmdevice': 'Kkmdevice',
  'lead': 'Lead',
  'leadactivity': 'Leadactivity',
  'leadstagehistory': 'Leadstagehistory',
  'companylocation': 'Companylocation',
  'customerloyalty': 'Customerloyalty',
  'loyaltylevel': 'Loyaltylevel',
  'loyaltyprogram': 'Loyaltyprogram',
  'loyaltytransaction': 'Loyaltytransaction',
  'message': 'Message',
  'companymodule': 'Companymodule',
  'notification': 'Notification',
  'notificationqueue': 'Notificationqueue',
  'notificationrule': 'Notificationrule',
  'notificationtemplate': 'Notificationtemplate',
  'order': 'Order',
  'orderhistory': 'Orderhistory',
  'orderpart': 'Orderpart',
  'orderphoto': 'Orderphoto',
  'orderservice': 'Orderservice',
  'orderstagehistory': 'Orderstagehistory',
  'payroll': 'Payroll',
  'payrollaccrual': 'Payrollaccrual',
  'payrollcalculation': 'Payrollcalculation',
  'payrollcalculationperiod': 'Payrollcalculationperiod',
  'payrollcalculationsnapshot': 'Payrollcalculationsnapshot',
  'payrollpayment': 'Payrollpayment',
  'payrollpaymentmethod': 'Payrollpaymentmethod',
  'payrollpaymentschedule': 'Payrollpaymentschedule',
  'payrollpaymentstatu': 'Payrollpaymentstatu',
  'payrollperiod': 'Payrollperiod',
  'payrollrule': 'Payrollrule',
  'payrollrulescope': 'Payrollrulescope',
  'payrollruletype': 'Payrollruletype',
  'performancealert': 'Performancealert',
  'performancemetric': 'Performancemetric',
  'permission': 'Permission',
  'rolepermission': 'Rolepermission',
  'photouploadrequest': 'Photouploadrequest',
  'planmodule': 'Planmodule',
  'pricerule': 'Pricerule',
  'qualitycheck': 'Qualitycheck',
  'qualitychecklist': 'Qualitychecklist',
  'qualityissue': 'Qualityissue',
  'qualityphoto': 'Qualityphoto',
  'qualitystandard': 'Qualitystandard',
  'qualitystandarditem': 'Qualitystandarditem',
  'receipt': 'Receipt',
  'receiptitem': 'Receiptitem',
  'request': 'Request',
  'requestevent': 'Requestevent',
  'requestsource': 'Requestsource',
  'resourceusage': 'Resourceusage',
  'role': 'Role',
  'sale': 'Sale',
  'saleitem': 'Saleitem',
  'salestarget': 'Salestarget',
  'loginattempt': 'Loginattempt',
  'securityevent': 'Securityevent',
  'securitylog': 'Securitylog',
  'securitysetting': 'Securitysetting',
  'service': 'Service',
  'servicecategory': 'Servicecategory',
  'companysetting': 'Companysetting',
  'companyworkinghour': 'Companyworkinghour',
  'configuration': 'Configuration',
  'shift': 'Shift',
  'shiftemployee': 'Shiftemployee',
  'smsmessage': 'Smsmessage',
  'smssetting': 'Smssetting',
  'initialstatuse': 'Initialstatuse',
  'status': 'Status',
  'statusconfiguration': 'Statusconfiguration',
  'statustransition': 'Statustransition',
  'companysubscription': 'Companysubscription',
  'locationsubscription': 'Locationsubscription',
  'subscriptioninvoice': 'Subscriptioninvoice',
  'subscriptionlimit': 'Subscriptionlimit',
  'subscriptionmodule': 'Subscriptionmodule',
  'subscriptionplan': 'Subscriptionplan',
  'supplier': 'Supplier',
  'endpointstat': 'Endpointstat',
  'seedhistory': 'Seedhistory',
  'systemmetric': 'Systemmetric',
  'task': 'Task',
  'telegrambinding': 'Telegrambinding',
  'telegramconfirmationcode': 'Telegramconfirmationcode',
  'telephonycall': 'Telephonycall',
  'telephonysetting': 'Telephonysetting',
  'printtemplate': 'Printtemplate',
  'template': 'Template',
  'templatetag': 'Templatetag',
  'templatetagcategorie': 'Templatetagcategorie',
  'templatetype': 'Templatetype',
  'visualtemplate': 'Visualtemplate',
  'unit': 'Unit',
  'user': 'User',
  'usersession': 'Usersession',
  'verificationlog': 'Verificationlog',
  'wallet': 'Wallet',
  'wallettransaction': 'Wallettransaction',
  'warehouse': 'Warehouse',
  'warehousemovement': 'Warehousemovement',
  'warranty': 'Warranty',
  'webhook': 'Webhook',
  'webhooklog': 'Webhooklog',
  'widget': 'Widget',
};

// Menu groups by permission base
export const MENU_GROUPS: Record<string, MenuItem[]> = {
  'adexpenses': [
    {
      id: 'adexpense',
      label: ENTITY_LABELS['adexpense'] || 'Adexpense',
      entity: ENTITY_NAMES.ADEXPENSE,
      permission: PERMISSIONS.ADEXPENSES_VIEW,
    },
  ],
  'adsources': [
    {
      id: 'adsource',
      label: ENTITY_LABELS['adsource'] || 'Adsource',
      entity: ENTITY_NAMES.ADSOURCE,
      permission: PERMISSIONS.ADSOURCES_VIEW,
    },
  ],
  'advertisingcampaigns': [
    {
      id: 'advertisingcampaign',
      label: ENTITY_LABELS['advertisingcampaign'] || 'Advertisingcampaign',
      entity: ENTITY_NAMES.ADVERTISINGCAMPAIGN,
      permission: PERMISSIONS.ADVERTISINGCAMPAIGNS_VIEW,
    },
  ],
  'advertisingexpenses': [
    {
      id: 'advertisingexpense',
      label: ENTITY_LABELS['advertisingexpense'] || 'Advertisingexpense',
      entity: ENTITY_NAMES.ADVERTISINGEXPENSE,
      permission: PERMISSIONS.ADVERTISINGEXPENSES_VIEW,
    },
  ],
  'analytics': [
    {
      id: 'analyticscustomeractivity',
      label: ENTITY_LABELS['analyticscustomeractivity'] || 'Analyticscustomeractivity',
      entity: ENTITY_NAMES.ANALYTICSCUSTOMERACTIVITY,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
    {
      id: 'analyticsdailyfinance',
      label: ENTITY_LABELS['analyticsdailyfinance'] || 'Analyticsdailyfinance',
      entity: ENTITY_NAMES.ANALYTICSDAILYFINANCE,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
    {
      id: 'analyticsdailyinventory',
      label: ENTITY_LABELS['analyticsdailyinventory'] || 'Analyticsdailyinventory',
      entity: ENTITY_NAMES.ANALYTICSDAILYINVENTORY,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
    {
      id: 'analyticsdailyorder',
      label: ENTITY_LABELS['analyticsdailyorder'] || 'Analyticsdailyorder',
      entity: ENTITY_NAMES.ANALYTICSDAILYORDER,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
    {
      id: 'analyticsdailysale',
      label: ENTITY_LABELS['analyticsdailysale'] || 'Analyticsdailysale',
      entity: ENTITY_NAMES.ANALYTICSDAILYSALE,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
    {
      id: 'analyticsemployeeperformance',
      label: ENTITY_LABELS['analyticsemployeeperformance'] || 'Analyticsemployeeperformance',
      entity: ENTITY_NAMES.ANALYTICSEMPLOYEEPERFORMANCE,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
    {
      id: 'analyticsrealtimemetric',
      label: ENTITY_LABELS['analyticsrealtimemetric'] || 'Analyticsrealtimemetric',
      entity: ENTITY_NAMES.ANALYTICSREALTIMEMETRIC,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
    {
      id: 'analyticsrefund',
      label: ENTITY_LABELS['analyticsrefund'] || 'Analyticsrefund',
      entity: ENTITY_NAMES.ANALYTICSREFUND,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
    {
      id: 'analyticsservicesale',
      label: ENTITY_LABELS['analyticsservicesale'] || 'Analyticsservicesale',
      entity: ENTITY_NAMES.ANALYTICSSERVICESALE,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
    {
      id: 'analyticssupplychain',
      label: ENTITY_LABELS['analyticssupplychain'] || 'Analyticssupplychain',
      entity: ENTITY_NAMES.ANALYTICSSUPPLYCHAIN,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
    {
      id: 'dailyanalytic',
      label: ENTITY_LABELS['dailyanalytic'] || 'Dailyanalytic',
      entity: ENTITY_NAMES.DAILYANALYTIC,
      permission: PERMISSIONS.ANALYTICS_VIEW,
    },
  ],
  'apikeys': [
    {
      id: 'apikey',
      label: ENTITY_LABELS['apikey'] || 'Apikey',
      entity: ENTITY_NAMES.APIKEY,
      permission: PERMISSIONS.APIKEYS_VIEW,
    },
  ],
  'auditlogs': [
    {
      id: 'auditlog',
      label: ENTITY_LABELS['auditlog'] || 'Auditlog',
      entity: ENTITY_NAMES.AUDITLOG,
      permission: PERMISSIONS.AUDITLOGS_VIEW,
    },
  ],
  'automation': [
    {
      id: 'automationrule',
      label: ENTITY_LABELS['automationrule'] || 'Automationrule',
      entity: ENTITY_NAMES.AUTOMATIONRULE,
      permission: PERMISSIONS.AUTOMATION_VIEW,
    },
  ],
  'brands': [
    {
      id: 'brand',
      label: ENTITY_LABELS['brand'] || 'Brand',
      entity: ENTITY_NAMES.BRAND,
      permission: PERMISSIONS.BRANDS_VIEW,
    },
  ],
  'calls': [
    {
      id: 'call',
      label: ENTITY_LABELS['call'] || 'Call',
      entity: ENTITY_NAMES.CALL,
      permission: PERMISSIONS.CALLS_VIEW,
    },
    {
      id: 'callrecording',
      label: ENTITY_LABELS['callrecording'] || 'Callrecording',
      entity: ENTITY_NAMES.CALLRECORDING,
      permission: PERMISSIONS.CALLS_VIEW,
    },
  ],
  'campaigns': [
    {
      id: 'campaign',
      label: ENTITY_LABELS['campaign'] || 'Campaign',
      entity: ENTITY_NAMES.CAMPAIGN,
      permission: PERMISSIONS.CAMPAIGNS_VIEW,
    },
    {
      id: 'campaignrecipient',
      label: ENTITY_LABELS['campaignrecipient'] || 'Campaignrecipient',
      entity: ENTITY_NAMES.CAMPAIGNRECIPIENT,
      permission: PERMISSIONS.CAMPAIGNS_VIEW,
    },
  ],
  'cashbox': [
    {
      id: 'cashbox',
      label: ENTITY_LABELS['cashbox'] || 'Cashbox',
      entity: ENTITY_NAMES.CASHBOX,
      permission: PERMISSIONS.CASHBOX_VIEW,
    },
  ],
  'cashier': [
    {
      id: 'cashiershift',
      label: ENTITY_LABELS['cashiershift'] || 'Cashiershift',
      entity: ENTITY_NAMES.CASHIERSHIFT,
      permission: PERMISSIONS.CASHIER_VIEW,
    },
  ],
  'cashregister': [
    {
      id: 'cashregisterhistory',
      label: ENTITY_LABELS['cashregisterhistory'] || 'Cashregisterhistory',
      entity: ENTITY_NAMES.CASHREGISTERHISTORY,
      permission: PERMISSIONS.CASHREGISTER_VIEW,
    },
    {
      id: 'cashregistertransaction',
      label: ENTITY_LABELS['cashregistertransaction'] || 'Cashregistertransaction',
      entity: ENTITY_NAMES.CASHREGISTERTRANSACTION,
      permission: PERMISSIONS.CASHREGISTER_VIEW,
    },
  ],
  'categories': [
    {
      id: 'category',
      label: ENTITY_LABELS['category'] || 'Category',
      entity: ENTITY_NAMES.CATEGORY,
      permission: PERMISSIONS.CATEGORIES_VIEW,
    },
  ],
  'chats': [
    {
      id: 'chat',
      label: ENTITY_LABELS['chat'] || 'Chat',
      entity: ENTITY_NAMES.CHAT,
      permission: PERMISSIONS.CHATS_VIEW,
    },
    {
      id: 'chatintegration',
      label: ENTITY_LABELS['chatintegration'] || 'Chatintegration',
      entity: ENTITY_NAMES.CHATINTEGRATION,
      permission: PERMISSIONS.CHATS_VIEW,
    },
    {
      id: 'chatparticipant',
      label: ENTITY_LABELS['chatparticipant'] || 'Chatparticipant',
      entity: ENTITY_NAMES.CHATPARTICIPANT,
      permission: PERMISSIONS.CHATS_VIEW,
    },
    {
      id: 'chattemplate',
      label: ENTITY_LABELS['chattemplate'] || 'Chattemplate',
      entity: ENTITY_NAMES.CHATTEMPLATE,
      permission: PERMISSIONS.CHATS_VIEW,
    },
    {
      id: 'chatwebhook',
      label: ENTITY_LABELS['chatwebhook'] || 'Chatwebhook',
      entity: ENTITY_NAMES.CHATWEBHOOK,
      permission: PERMISSIONS.CHATS_VIEW,
    },
  ],
  'companies': [
    {
      id: 'companie',
      label: ENTITY_LABELS['companie'] || 'Companie',
      entity: ENTITY_NAMES.COMPANIE,
      permission: PERMISSIONS.COMPANIES_VIEW,
    },
  ],
  'contacts': [
    {
      id: 'contact',
      label: ENTITY_LABELS['contact'] || 'Contact',
      entity: ENTITY_NAMES.CONTACT,
      permission: PERMISSIONS.CONTACTS_VIEW,
    },
    {
      id: 'contactevent',
      label: ENTITY_LABELS['contactevent'] || 'Contactevent',
      entity: ENTITY_NAMES.CONTACTEVENT,
      permission: PERMISSIONS.CONTACTS_VIEW,
    },
  ],
  'customers': [
    {
      id: 'customer',
      label: ENTITY_LABELS['customer'] || 'Customer',
      entity: ENTITY_NAMES.CUSTOMER,
      permission: PERMISSIONS.CUSTOMERS_VIEW,
    },
    {
      id: 'customerbalancehistory',
      label: ENTITY_LABELS['customerbalancehistory'] || 'Customerbalancehistory',
      entity: ENTITY_NAMES.CUSTOMERBALANCEHISTORY,
      permission: PERMISSIONS.CUSTOMERS_VIEW,
    },
    {
      id: 'customerdevice',
      label: ENTITY_LABELS['customerdevice'] || 'Customerdevice',
      entity: ENTITY_NAMES.CUSTOMERDEVICE,
      permission: PERMISSIONS.CUSTOMERS_VIEW,
    },
    {
      id: 'customerregistrationtoken',
      label: ENTITY_LABELS['customerregistrationtoken'] || 'Customerregistrationtoken',
      entity: ENTITY_NAMES.CUSTOMERREGISTRATIONTOKEN,
      permission: PERMISSIONS.CUSTOMERS_VIEW,
    },
  ],
  'devices': [
    {
      id: 'devicemodel',
      label: ENTITY_LABELS['devicemodel'] || 'Devicemodel',
      entity: ENTITY_NAMES.DEVICEMODEL,
      permission: PERMISSIONS.DEVICES_VIEW,
    },
    {
      id: 'devicetype',
      label: ENTITY_LABELS['devicetype'] || 'Devicetype',
      entity: ENTITY_NAMES.DEVICETYPE,
      permission: PERMISSIONS.DEVICES_VIEW,
    },
  ],
  'discounts': [
    {
      id: 'discount',
      label: ENTITY_LABELS['discount'] || 'Discount',
      entity: ENTITY_NAMES.DISCOUNT,
      permission: PERMISSIONS.DISCOUNTS_VIEW,
    },
  ],
  'documents': [
    {
      id: 'document',
      label: ENTITY_LABELS['document'] || 'Document',
      entity: ENTITY_NAMES.DOCUMENT,
      permission: PERMISSIONS.DOCUMENTS_VIEW,
    },
    {
      id: 'documentprint',
      label: ENTITY_LABELS['documentprint'] || 'Documentprint',
      entity: ENTITY_NAMES.DOCUMENTPRINT,
      permission: PERMISSIONS.DOCUMENTS_VIEW,
    },
    {
      id: 'documenttemplate',
      label: ENTITY_LABELS['documenttemplate'] || 'Documenttemplate',
      entity: ENTITY_NAMES.DOCUMENTTEMPLATE,
      permission: PERMISSIONS.DOCUMENTS_VIEW,
    },
    {
      id: 'documenttype',
      label: ENTITY_LABELS['documenttype'] || 'Documenttype',
      entity: ENTITY_NAMES.DOCUMENTTYPE,
      permission: PERMISSIONS.DOCUMENTS_VIEW,
    },
  ],
  'employees': [
    {
      id: 'employee',
      label: ENTITY_LABELS['employee'] || 'Employee',
      entity: ENTITY_NAMES.EMPLOYEE,
      permission: PERMISSIONS.EMPLOYEES_VIEW,
    },
    {
      id: 'employeeperformance',
      label: ENTITY_LABELS['employeeperformance'] || 'Employeeperformance',
      entity: ENTITY_NAMES.EMPLOYEEPERFORMANCE,
      permission: PERMISSIONS.EMPLOYEES_VIEW,
    },
    {
      id: 'employeesetting',
      label: ENTITY_LABELS['employeesetting'] || 'Employeesetting',
      entity: ENTITY_NAMES.EMPLOYEESETTING,
      permission: PERMISSIONS.EMPLOYEES_VIEW,
    },
  ],
  'events': [
    {
      id: 'eventlog',
      label: ENTITY_LABELS['eventlog'] || 'Eventlog',
      entity: ENTITY_NAMES.EVENTLOG,
      permission: PERMISSIONS.EVENTS_VIEW,
    },
    {
      id: 'eventtype',
      label: ENTITY_LABELS['eventtype'] || 'Eventtype',
      entity: ENTITY_NAMES.EVENTTYPE,
      permission: PERMISSIONS.EVENTS_VIEW,
    },
    {
      id: 'eventtypescatalog',
      label: ENTITY_LABELS['eventtypescatalog'] || 'Eventtypescatalog',
      entity: ENTITY_NAMES.EVENTTYPESCATALOG,
      permission: PERMISSIONS.EVENTS_VIEW,
    },
  ],
  'finance': [
    {
      id: 'financialtransaction',
      label: ENTITY_LABELS['financialtransaction'] || 'Financialtransaction',
      entity: ENTITY_NAMES.FINANCIALTRANSACTION,
      permission: PERMISSIONS.FINANCE_VIEW,
    },
    {
      id: 'moneymovement',
      label: ENTITY_LABELS['moneymovement'] || 'Moneymovement',
      entity: ENTITY_NAMES.MONEYMOVEMENT,
      permission: PERMISSIONS.FINANCE_VIEW,
    },
  ],
  'funnel': [
    {
      id: 'funnelstage',
      label: ENTITY_LABELS['funnelstage'] || 'Funnelstage',
      entity: ENTITY_NAMES.FUNNELSTAGE,
      permission: PERMISSIONS.FUNNEL_VIEW,
    },
  ],
  'inventory': [
    {
      id: 'inventoryitem',
      label: ENTITY_LABELS['inventoryitem'] || 'Inventoryitem',
      entity: ENTITY_NAMES.INVENTORYITEM,
      permission: PERMISSIONS.INVENTORY_VIEW,
    },
    {
      id: 'inventorymovement',
      label: ENTITY_LABELS['inventorymovement'] || 'Inventorymovement',
      entity: ENTITY_NAMES.INVENTORYMOVEMENT,
      permission: PERMISSIONS.INVENTORY_VIEW,
    },
  ],
  'issues': [
    {
      id: 'issue',
      label: ENTITY_LABELS['issue'] || 'Issue',
      entity: ENTITY_NAMES.ISSUE,
      permission: PERMISSIONS.ISSUES_VIEW,
    },
  ],
  'kkm': [
    {
      id: 'kkmdevice',
      label: ENTITY_LABELS['kkmdevice'] || 'Kkmdevice',
      entity: ENTITY_NAMES.KKMDEVICE,
      permission: PERMISSIONS.KKM_VIEW,
    },
  ],
  'leads': [
    {
      id: 'lead',
      label: ENTITY_LABELS['lead'] || 'Lead',
      entity: ENTITY_NAMES.LEAD,
      permission: PERMISSIONS.LEADS_VIEW,
    },
    {
      id: 'leadactivity',
      label: ENTITY_LABELS['leadactivity'] || 'Leadactivity',
      entity: ENTITY_NAMES.LEADACTIVITY,
      permission: PERMISSIONS.LEADS_VIEW,
    },
    {
      id: 'leadstagehistory',
      label: ENTITY_LABELS['leadstagehistory'] || 'Leadstagehistory',
      entity: ENTITY_NAMES.LEADSTAGEHISTORY,
      permission: PERMISSIONS.LEADS_VIEW,
    },
  ],
  'locations': [
    {
      id: 'companylocation',
      label: ENTITY_LABELS['companylocation'] || 'Companylocation',
      entity: ENTITY_NAMES.COMPANYLOCATION,
      permission: PERMISSIONS.LOCATIONS_VIEW,
    },
  ],
  'loyalty': [
    {
      id: 'customerloyalty',
      label: ENTITY_LABELS['customerloyalty'] || 'Customerloyalty',
      entity: ENTITY_NAMES.CUSTOMERLOYALTY,
      permission: PERMISSIONS.LOYALTY_VIEW,
    },
    {
      id: 'loyaltylevel',
      label: ENTITY_LABELS['loyaltylevel'] || 'Loyaltylevel',
      entity: ENTITY_NAMES.LOYALTYLEVEL,
      permission: PERMISSIONS.LOYALTY_VIEW,
    },
    {
      id: 'loyaltyprogram',
      label: ENTITY_LABELS['loyaltyprogram'] || 'Loyaltyprogram',
      entity: ENTITY_NAMES.LOYALTYPROGRAM,
      permission: PERMISSIONS.LOYALTY_VIEW,
    },
    {
      id: 'loyaltytransaction',
      label: ENTITY_LABELS['loyaltytransaction'] || 'Loyaltytransaction',
      entity: ENTITY_NAMES.LOYALTYTRANSACTION,
      permission: PERMISSIONS.LOYALTY_VIEW,
    },
  ],
  'messages': [
    {
      id: 'message',
      label: ENTITY_LABELS['message'] || 'Message',
      entity: ENTITY_NAMES.MESSAGE,
      permission: PERMISSIONS.MESSAGES_VIEW,
    },
  ],
  'modules': [
    {
      id: 'companymodule',
      label: ENTITY_LABELS['companymodule'] || 'Companymodule',
      entity: ENTITY_NAMES.COMPANYMODULE,
      permission: PERMISSIONS.MODULES_VIEW,
    },
  ],
  'notifications': [
    {
      id: 'notification',
      label: ENTITY_LABELS['notification'] || 'Notification',
      entity: ENTITY_NAMES.NOTIFICATION,
      permission: PERMISSIONS.NOTIFICATIONS_VIEW,
    },
    {
      id: 'notificationqueue',
      label: ENTITY_LABELS['notificationqueue'] || 'Notificationqueue',
      entity: ENTITY_NAMES.NOTIFICATIONQUEUE,
      permission: PERMISSIONS.NOTIFICATIONS_VIEW,
    },
    {
      id: 'notificationrule',
      label: ENTITY_LABELS['notificationrule'] || 'Notificationrule',
      entity: ENTITY_NAMES.NOTIFICATIONRULE,
      permission: PERMISSIONS.NOTIFICATIONS_VIEW,
    },
    {
      id: 'notificationtemplate',
      label: ENTITY_LABELS['notificationtemplate'] || 'Notificationtemplate',
      entity: ENTITY_NAMES.NOTIFICATIONTEMPLATE,
      permission: PERMISSIONS.NOTIFICATIONS_VIEW,
    },
  ],
  'orders': [
    {
      id: 'order',
      label: ENTITY_LABELS['order'] || 'Order',
      entity: ENTITY_NAMES.ORDER,
      permission: PERMISSIONS.ORDERS_VIEW,
    },
    {
      id: 'orderhistory',
      label: ENTITY_LABELS['orderhistory'] || 'Orderhistory',
      entity: ENTITY_NAMES.ORDERHISTORY,
      permission: PERMISSIONS.ORDERS_VIEW,
    },
    {
      id: 'orderpart',
      label: ENTITY_LABELS['orderpart'] || 'Orderpart',
      entity: ENTITY_NAMES.ORDERPART,
      permission: PERMISSIONS.ORDERS_VIEW,
    },
    {
      id: 'orderphoto',
      label: ENTITY_LABELS['orderphoto'] || 'Orderphoto',
      entity: ENTITY_NAMES.ORDERPHOTO,
      permission: PERMISSIONS.ORDERS_VIEW,
    },
    {
      id: 'orderservice',
      label: ENTITY_LABELS['orderservice'] || 'Orderservice',
      entity: ENTITY_NAMES.ORDERSERVICE,
      permission: PERMISSIONS.ORDERS_VIEW,
    },
    {
      id: 'orderstagehistory',
      label: ENTITY_LABELS['orderstagehistory'] || 'Orderstagehistory',
      entity: ENTITY_NAMES.ORDERSTAGEHISTORY,
      permission: PERMISSIONS.ORDERS_VIEW,
    },
  ],
  'payroll': [
    {
      id: 'payroll',
      label: ENTITY_LABELS['payroll'] || 'Payroll',
      entity: ENTITY_NAMES.PAYROLL,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
    {
      id: 'payrollaccrual',
      label: ENTITY_LABELS['payrollaccrual'] || 'Payrollaccrual',
      entity: ENTITY_NAMES.PAYROLLACCRUAL,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
    {
      id: 'payrollcalculation',
      label: ENTITY_LABELS['payrollcalculation'] || 'Payrollcalculation',
      entity: ENTITY_NAMES.PAYROLLCALCULATION,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
    {
      id: 'payrollcalculationperiod',
      label: ENTITY_LABELS['payrollcalculationperiod'] || 'Payrollcalculationperiod',
      entity: ENTITY_NAMES.PAYROLLCALCULATIONPERIOD,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
    {
      id: 'payrollcalculationsnapshot',
      label: ENTITY_LABELS['payrollcalculationsnapshot'] || 'Payrollcalculationsnapshot',
      entity: ENTITY_NAMES.PAYROLLCALCULATIONSNAPSHOT,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
    {
      id: 'payrollpayment',
      label: ENTITY_LABELS['payrollpayment'] || 'Payrollpayment',
      entity: ENTITY_NAMES.PAYROLLPAYMENT,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
    {
      id: 'payrollpaymentmethod',
      label: ENTITY_LABELS['payrollpaymentmethod'] || 'Payrollpaymentmethod',
      entity: ENTITY_NAMES.PAYROLLPAYMENTMETHOD,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
    {
      id: 'payrollpaymentschedule',
      label: ENTITY_LABELS['payrollpaymentschedule'] || 'Payrollpaymentschedule',
      entity: ENTITY_NAMES.PAYROLLPAYMENTSCHEDULE,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
    {
      id: 'payrollpaymentstatu',
      label: ENTITY_LABELS['payrollpaymentstatu'] || 'Payrollpaymentstatu',
      entity: ENTITY_NAMES.PAYROLLPAYMENTSTATU,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
    {
      id: 'payrollperiod',
      label: ENTITY_LABELS['payrollperiod'] || 'Payrollperiod',
      entity: ENTITY_NAMES.PAYROLLPERIOD,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
    {
      id: 'payrollrule',
      label: ENTITY_LABELS['payrollrule'] || 'Payrollrule',
      entity: ENTITY_NAMES.PAYROLLRULE,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
    {
      id: 'payrollrulescope',
      label: ENTITY_LABELS['payrollrulescope'] || 'Payrollrulescope',
      entity: ENTITY_NAMES.PAYROLLRULESCOPE,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
    {
      id: 'payrollruletype',
      label: ENTITY_LABELS['payrollruletype'] || 'Payrollruletype',
      entity: ENTITY_NAMES.PAYROLLRULETYPE,
      permission: PERMISSIONS.PAYROLL_VIEW,
    },
  ],
  'performance': [
    {
      id: 'performancealert',
      label: ENTITY_LABELS['performancealert'] || 'Performancealert',
      entity: ENTITY_NAMES.PERFORMANCEALERT,
      permission: PERMISSIONS.PERFORMANCE_VIEW,
    },
    {
      id: 'performancemetric',
      label: ENTITY_LABELS['performancemetric'] || 'Performancemetric',
      entity: ENTITY_NAMES.PERFORMANCEMETRIC,
      permission: PERMISSIONS.PERFORMANCE_VIEW,
    },
  ],
  'permissions': [
    {
      id: 'permission',
      label: ENTITY_LABELS['permission'] || 'Permission',
      entity: ENTITY_NAMES.PERMISSION,
      permission: PERMISSIONS.PERMISSIONS_VIEW,
    },
    {
      id: 'rolepermission',
      label: ENTITY_LABELS['rolepermission'] || 'Rolepermission',
      entity: ENTITY_NAMES.ROLEPERMISSION,
      permission: PERMISSIONS.PERMISSIONS_VIEW,
    },
  ],
  'photos': [
    {
      id: 'photouploadrequest',
      label: ENTITY_LABELS['photouploadrequest'] || 'Photouploadrequest',
      entity: ENTITY_NAMES.PHOTOUPLOADREQUEST,
      permission: PERMISSIONS.PHOTOS_VIEW,
    },
  ],
  'plans': [
    {
      id: 'planmodule',
      label: ENTITY_LABELS['planmodule'] || 'Planmodule',
      entity: ENTITY_NAMES.PLANMODULE,
      permission: PERMISSIONS.PLANS_VIEW,
    },
  ],
  'pricing': [
    {
      id: 'pricerule',
      label: ENTITY_LABELS['pricerule'] || 'Pricerule',
      entity: ENTITY_NAMES.PRICERULE,
      permission: PERMISSIONS.PRICING_VIEW,
    },
  ],
  'quality': [
    {
      id: 'qualitycheck',
      label: ENTITY_LABELS['qualitycheck'] || 'Qualitycheck',
      entity: ENTITY_NAMES.QUALITYCHECK,
      permission: PERMISSIONS.QUALITY_VIEW,
    },
    {
      id: 'qualitychecklist',
      label: ENTITY_LABELS['qualitychecklist'] || 'Qualitychecklist',
      entity: ENTITY_NAMES.QUALITYCHECKLIST,
      permission: PERMISSIONS.QUALITY_VIEW,
    },
    {
      id: 'qualityissue',
      label: ENTITY_LABELS['qualityissue'] || 'Qualityissue',
      entity: ENTITY_NAMES.QUALITYISSUE,
      permission: PERMISSIONS.QUALITY_VIEW,
    },
    {
      id: 'qualityphoto',
      label: ENTITY_LABELS['qualityphoto'] || 'Qualityphoto',
      entity: ENTITY_NAMES.QUALITYPHOTO,
      permission: PERMISSIONS.QUALITY_VIEW,
    },
    {
      id: 'qualitystandard',
      label: ENTITY_LABELS['qualitystandard'] || 'Qualitystandard',
      entity: ENTITY_NAMES.QUALITYSTANDARD,
      permission: PERMISSIONS.QUALITY_VIEW,
    },
    {
      id: 'qualitystandarditem',
      label: ENTITY_LABELS['qualitystandarditem'] || 'Qualitystandarditem',
      entity: ENTITY_NAMES.QUALITYSTANDARDITEM,
      permission: PERMISSIONS.QUALITY_VIEW,
    },
  ],
  'receipts': [
    {
      id: 'receipt',
      label: ENTITY_LABELS['receipt'] || 'Receipt',
      entity: ENTITY_NAMES.RECEIPT,
      permission: PERMISSIONS.RECEIPTS_VIEW,
    },
    {
      id: 'receiptitem',
      label: ENTITY_LABELS['receiptitem'] || 'Receiptitem',
      entity: ENTITY_NAMES.RECEIPTITEM,
      permission: PERMISSIONS.RECEIPTS_VIEW,
    },
  ],
  'requests': [
    {
      id: 'request',
      label: ENTITY_LABELS['request'] || 'Request',
      entity: ENTITY_NAMES.REQUEST,
      permission: PERMISSIONS.REQUESTS_VIEW,
    },
    {
      id: 'requestevent',
      label: ENTITY_LABELS['requestevent'] || 'Requestevent',
      entity: ENTITY_NAMES.REQUESTEVENT,
      permission: PERMISSIONS.REQUESTS_VIEW,
    },
    {
      id: 'requestsource',
      label: ENTITY_LABELS['requestsource'] || 'Requestsource',
      entity: ENTITY_NAMES.REQUESTSOURCE,
      permission: PERMISSIONS.REQUESTS_VIEW,
    },
  ],
  'resources': [
    {
      id: 'resourceusage',
      label: ENTITY_LABELS['resourceusage'] || 'Resourceusage',
      entity: ENTITY_NAMES.RESOURCEUSAGE,
      permission: PERMISSIONS.RESOURCES_VIEW,
    },
  ],
  'roles': [
    {
      id: 'role',
      label: ENTITY_LABELS['role'] || 'Role',
      entity: ENTITY_NAMES.ROLE,
      permission: PERMISSIONS.ROLES_VIEW,
    },
  ],
  'sales': [
    {
      id: 'sale',
      label: ENTITY_LABELS['sale'] || 'Sale',
      entity: ENTITY_NAMES.SALE,
      permission: PERMISSIONS.SALES_VIEW,
    },
    {
      id: 'saleitem',
      label: ENTITY_LABELS['saleitem'] || 'Saleitem',
      entity: ENTITY_NAMES.SALEITEM,
      permission: PERMISSIONS.SALES_VIEW,
    },
    {
      id: 'salestarget',
      label: ENTITY_LABELS['salestarget'] || 'Salestarget',
      entity: ENTITY_NAMES.SALESTARGET,
      permission: PERMISSIONS.SALES_VIEW,
    },
  ],
  'security': [
    {
      id: 'loginattempt',
      label: ENTITY_LABELS['loginattempt'] || 'Loginattempt',
      entity: ENTITY_NAMES.LOGINATTEMPT,
      permission: PERMISSIONS.SECURITY_VIEW,
    },
    {
      id: 'securityevent',
      label: ENTITY_LABELS['securityevent'] || 'Securityevent',
      entity: ENTITY_NAMES.SECURITYEVENT,
      permission: PERMISSIONS.SECURITY_VIEW,
    },
    {
      id: 'securitylog',
      label: ENTITY_LABELS['securitylog'] || 'Securitylog',
      entity: ENTITY_NAMES.SECURITYLOG,
      permission: PERMISSIONS.SECURITY_VIEW,
    },
    {
      id: 'securitysetting',
      label: ENTITY_LABELS['securitysetting'] || 'Securitysetting',
      entity: ENTITY_NAMES.SECURITYSETTING,
      permission: PERMISSIONS.SECURITY_VIEW,
    },
  ],
  'services': [
    {
      id: 'service',
      label: ENTITY_LABELS['service'] || 'Service',
      entity: ENTITY_NAMES.SERVICE,
      permission: PERMISSIONS.SERVICES_VIEW,
    },
    {
      id: 'servicecategory',
      label: ENTITY_LABELS['servicecategory'] || 'Servicecategory',
      entity: ENTITY_NAMES.SERVICECATEGORY,
      permission: PERMISSIONS.SERVICES_VIEW,
    },
  ],
  'settings': [
    {
      id: 'companysetting',
      label: ENTITY_LABELS['companysetting'] || 'Companysetting',
      entity: ENTITY_NAMES.COMPANYSETTING,
      permission: PERMISSIONS.SETTINGS_VIEW,
    },
    {
      id: 'companyworkinghour',
      label: ENTITY_LABELS['companyworkinghour'] || 'Companyworkinghour',
      entity: ENTITY_NAMES.COMPANYWORKINGHOUR,
      permission: PERMISSIONS.SETTINGS_VIEW,
    },
    {
      id: 'configuration',
      label: ENTITY_LABELS['configuration'] || 'Configuration',
      entity: ENTITY_NAMES.CONFIGURATION,
      permission: PERMISSIONS.SETTINGS_VIEW,
    },
  ],
  'shifts': [
    {
      id: 'shift',
      label: ENTITY_LABELS['shift'] || 'Shift',
      entity: ENTITY_NAMES.SHIFT,
      permission: PERMISSIONS.SHIFTS_VIEW,
    },
    {
      id: 'shiftemployee',
      label: ENTITY_LABELS['shiftemployee'] || 'Shiftemployee',
      entity: ENTITY_NAMES.SHIFTEMPLOYEE,
      permission: PERMISSIONS.SHIFTS_VIEW,
    },
  ],
  'sms': [
    {
      id: 'smsmessage',
      label: ENTITY_LABELS['smsmessage'] || 'Smsmessage',
      entity: ENTITY_NAMES.SMSMESSAGE,
      permission: PERMISSIONS.SMS_VIEW,
    },
    {
      id: 'smssetting',
      label: ENTITY_LABELS['smssetting'] || 'Smssetting',
      entity: ENTITY_NAMES.SMSSETTING,
      permission: PERMISSIONS.SMS_VIEW,
    },
  ],
  'statuses': [
    {
      id: 'initialstatuse',
      label: ENTITY_LABELS['initialstatuse'] || 'Initialstatuse',
      entity: ENTITY_NAMES.INITIALSTATUSE,
      permission: PERMISSIONS.STATUSES_VIEW,
    },
    {
      id: 'status',
      label: ENTITY_LABELS['status'] || 'Status',
      entity: ENTITY_NAMES.STATUS,
      permission: PERMISSIONS.STATUSES_VIEW,
    },
    {
      id: 'statusconfiguration',
      label: ENTITY_LABELS['statusconfiguration'] || 'Statusconfiguration',
      entity: ENTITY_NAMES.STATUSCONFIGURATION,
      permission: PERMISSIONS.STATUSES_VIEW,
    },
    {
      id: 'statustransition',
      label: ENTITY_LABELS['statustransition'] || 'Statustransition',
      entity: ENTITY_NAMES.STATUSTRANSITION,
      permission: PERMISSIONS.STATUSES_VIEW,
    },
  ],
  'subscriptions': [
    {
      id: 'companysubscription',
      label: ENTITY_LABELS['companysubscription'] || 'Companysubscription',
      entity: ENTITY_NAMES.COMPANYSUBSCRIPTION,
      permission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
    },
    {
      id: 'locationsubscription',
      label: ENTITY_LABELS['locationsubscription'] || 'Locationsubscription',
      entity: ENTITY_NAMES.LOCATIONSUBSCRIPTION,
      permission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
    },
    {
      id: 'subscriptioninvoice',
      label: ENTITY_LABELS['subscriptioninvoice'] || 'Subscriptioninvoice',
      entity: ENTITY_NAMES.SUBSCRIPTIONINVOICE,
      permission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
    },
    {
      id: 'subscriptionlimit',
      label: ENTITY_LABELS['subscriptionlimit'] || 'Subscriptionlimit',
      entity: ENTITY_NAMES.SUBSCRIPTIONLIMIT,
      permission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
    },
    {
      id: 'subscriptionmodule',
      label: ENTITY_LABELS['subscriptionmodule'] || 'Subscriptionmodule',
      entity: ENTITY_NAMES.SUBSCRIPTIONMODULE,
      permission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
    },
    {
      id: 'subscriptionplan',
      label: ENTITY_LABELS['subscriptionplan'] || 'Subscriptionplan',
      entity: ENTITY_NAMES.SUBSCRIPTIONPLAN,
      permission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
    },
  ],
  'suppliers': [
    {
      id: 'supplier',
      label: ENTITY_LABELS['supplier'] || 'Supplier',
      entity: ENTITY_NAMES.SUPPLIER,
      permission: PERMISSIONS.SUPPLIERS_VIEW,
    },
  ],
  'system': [
    {
      id: 'endpointstat',
      label: ENTITY_LABELS['endpointstat'] || 'Endpointstat',
      entity: ENTITY_NAMES.ENDPOINTSTAT,
      permission: PERMISSIONS.SYSTEM_VIEW,
    },
    {
      id: 'seedhistory',
      label: ENTITY_LABELS['seedhistory'] || 'Seedhistory',
      entity: ENTITY_NAMES.SEEDHISTORY,
      permission: PERMISSIONS.SYSTEM_VIEW,
    },
    {
      id: 'systemmetric',
      label: ENTITY_LABELS['systemmetric'] || 'Systemmetric',
      entity: ENTITY_NAMES.SYSTEMMETRIC,
      permission: PERMISSIONS.SYSTEM_VIEW,
    },
  ],
  'tasks': [
    {
      id: 'task',
      label: ENTITY_LABELS['task'] || 'Task',
      entity: ENTITY_NAMES.TASK,
      permission: PERMISSIONS.TASKS_VIEW,
    },
  ],
  'telegram': [
    {
      id: 'telegrambinding',
      label: ENTITY_LABELS['telegrambinding'] || 'Telegrambinding',
      entity: ENTITY_NAMES.TELEGRAMBINDING,
      permission: PERMISSIONS.TELEGRAM_VIEW,
    },
    {
      id: 'telegramconfirmationcode',
      label: ENTITY_LABELS['telegramconfirmationcode'] || 'Telegramconfirmationcode',
      entity: ENTITY_NAMES.TELEGRAMCONFIRMATIONCODE,
      permission: PERMISSIONS.TELEGRAM_VIEW,
    },
  ],
  'telephony': [
    {
      id: 'telephonycall',
      label: ENTITY_LABELS['telephonycall'] || 'Telephonycall',
      entity: ENTITY_NAMES.TELEPHONYCALL,
      permission: PERMISSIONS.TELEPHONY_VIEW,
    },
    {
      id: 'telephonysetting',
      label: ENTITY_LABELS['telephonysetting'] || 'Telephonysetting',
      entity: ENTITY_NAMES.TELEPHONYSETTING,
      permission: PERMISSIONS.TELEPHONY_VIEW,
    },
  ],
  'templates': [
    {
      id: 'printtemplate',
      label: ENTITY_LABELS['printtemplate'] || 'Printtemplate',
      entity: ENTITY_NAMES.PRINTTEMPLATE,
      permission: PERMISSIONS.TEMPLATES_VIEW,
    },
    {
      id: 'template',
      label: ENTITY_LABELS['template'] || 'Template',
      entity: ENTITY_NAMES.TEMPLATE,
      permission: PERMISSIONS.TEMPLATES_VIEW,
    },
    {
      id: 'templatetag',
      label: ENTITY_LABELS['templatetag'] || 'Templatetag',
      entity: ENTITY_NAMES.TEMPLATETAG,
      permission: PERMISSIONS.TEMPLATES_VIEW,
    },
    {
      id: 'templatetagcategorie',
      label: ENTITY_LABELS['templatetagcategorie'] || 'Templatetagcategorie',
      entity: ENTITY_NAMES.TEMPLATETAGCATEGORIE,
      permission: PERMISSIONS.TEMPLATES_VIEW,
    },
    {
      id: 'templatetype',
      label: ENTITY_LABELS['templatetype'] || 'Templatetype',
      entity: ENTITY_NAMES.TEMPLATETYPE,
      permission: PERMISSIONS.TEMPLATES_VIEW,
    },
    {
      id: 'visualtemplate',
      label: ENTITY_LABELS['visualtemplate'] || 'Visualtemplate',
      entity: ENTITY_NAMES.VISUALTEMPLATE,
      permission: PERMISSIONS.TEMPLATES_VIEW,
    },
  ],
  'units': [
    {
      id: 'unit',
      label: ENTITY_LABELS['unit'] || 'Unit',
      entity: ENTITY_NAMES.UNIT,
      permission: PERMISSIONS.UNITS_VIEW,
    },
  ],
  'users': [
    {
      id: 'user',
      label: ENTITY_LABELS['user'] || 'User',
      entity: ENTITY_NAMES.USER,
      permission: PERMISSIONS.USERS_VIEW,
    },
    {
      id: 'usersession',
      label: ENTITY_LABELS['usersession'] || 'Usersession',
      entity: ENTITY_NAMES.USERSESSION,
      permission: PERMISSIONS.USERS_VIEW,
    },
  ],
  'verification': [
    {
      id: 'verificationlog',
      label: ENTITY_LABELS['verificationlog'] || 'Verificationlog',
      entity: ENTITY_NAMES.VERIFICATIONLOG,
      permission: PERMISSIONS.VERIFICATION_VIEW,
    },
  ],
  'wallets': [
    {
      id: 'wallet',
      label: ENTITY_LABELS['wallet'] || 'Wallet',
      entity: ENTITY_NAMES.WALLET,
      permission: PERMISSIONS.WALLETS_VIEW,
    },
    {
      id: 'wallettransaction',
      label: ENTITY_LABELS['wallettransaction'] || 'Wallettransaction',
      entity: ENTITY_NAMES.WALLETTRANSACTION,
      permission: PERMISSIONS.WALLETS_VIEW,
    },
  ],
  'warehouses': [
    {
      id: 'warehouse',
      label: ENTITY_LABELS['warehouse'] || 'Warehouse',
      entity: ENTITY_NAMES.WAREHOUSE,
      permission: PERMISSIONS.WAREHOUSES_VIEW,
    },
    {
      id: 'warehousemovement',
      label: ENTITY_LABELS['warehousemovement'] || 'Warehousemovement',
      entity: ENTITY_NAMES.WAREHOUSEMOVEMENT,
      permission: PERMISSIONS.WAREHOUSES_VIEW,
    },
  ],
  'warranties': [
    {
      id: 'warranty',
      label: ENTITY_LABELS['warranty'] || 'Warranty',
      entity: ENTITY_NAMES.WARRANTY,
      permission: PERMISSIONS.WARRANTIES_VIEW,
    },
  ],
  'webhooks': [
    {
      id: 'webhook',
      label: ENTITY_LABELS['webhook'] || 'Webhook',
      entity: ENTITY_NAMES.WEBHOOK,
      permission: PERMISSIONS.WEBHOOKS_VIEW,
    },
    {
      id: 'webhooklog',
      label: ENTITY_LABELS['webhooklog'] || 'Webhooklog',
      entity: ENTITY_NAMES.WEBHOOKLOG,
      permission: PERMISSIONS.WEBHOOKS_VIEW,
    },
  ],
  'widgets': [
    {
      id: 'widget',
      label: ENTITY_LABELS['widget'] || 'Widget',
      entity: ENTITY_NAMES.WIDGET,
      permission: PERMISSIONS.WIDGETS_VIEW,
    },
  ],
};

// Flat menu items (for search, breadcrumbs, etc.)
export const ALL_MENU_ITEMS: MenuItem[] = Object.values(MENU_GROUPS).flat();

// Helper to get menu item by entity
export function getMenuItemByEntity(entity: EntityName): MenuItem | undefined {
  return ALL_MENU_ITEMS.find(item => item.entity === entity);
}

// Helper to filter menu by permissions
export function filterMenuByPermissions(menu: MenuItem[], userPermissions: string[]): MenuItem[] {
  return menu.filter(item => {
    if (!item.permission) return true;
    return userPermissions.includes(item.permission);
  }).map(item => {
    if (item.children) {
      return {
        ...item,
        children: filterMenuByPermissions(item.children, userPermissions),
      };
    }
    return item;
  });
}
