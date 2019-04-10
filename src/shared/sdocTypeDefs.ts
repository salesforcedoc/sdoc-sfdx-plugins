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
    // profile query
    UserLicense: {
      Name: string;
    }
    // role query
    PortalType: string;
    ParentRoleId: string;
    // user query
    UserRoleId: string;
    UserLicenseName: string;
    // expr0 - for group by queries, min, max, sum, avg
    expr0: string;
    attributes: {
      // for query on Layout 
      type: string;
      url: string;
    };
    // for query on Layout 
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