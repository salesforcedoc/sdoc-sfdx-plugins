interface SObjectResponse {
  sobjects: [
    {
      name: string;
      keyPrefix: string;
      custom: boolean;
      customSetting: boolean;
    }
  ]
}

interface ToolingLayoutResponse {
  Id: string;
  Name: string;
  NamespacePrefix: string;
  LayoutType: string;
  Metadata: {
    layoutSections: [{
      label: string;
      layoutColumns: [{
        layoutItems: [{
            emptySpace: boolean;
            field: string;
          }]
        }]
      }]
  }
}

interface SObjectLayoutResponse {
  Id: string;
  Fullname: string;
}

// for a lot of different queries
interface QueryResponse {
  // common
  size: number;
  totalSize: number;
  done: boolean;
  entityTypeName: string;
  records: [ {
    // common
    Id: string;
    Name: string;

    // added for PermisssionSet query 
    Label: string;
    License: {
      Name: string;
    }
    // added for Profile query
    UserLicense: {
      Name: string;
    }
    // added for UserRole query
    PortalType: string;
    ParentRoleId: string;
    // added for User query
    UserRoleId: string;
    // expr0,count - for group by queries, min, max, sum, avg
    expr0: string;
    count: string;
    // common
    attributes: {
      // added for Layout query
      type: string;
      url: string;
    };
    // added for Layout query
    DeveloperName: string;
    NamespacePrefix: string;
    SharingModel: string;
  }];
}

export { 
  SObjectResponse, 
  ToolingLayoutResponse,
  SObjectLayoutResponse,
  QueryResponse
};