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
    // user query
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
    // for query on Content
    ContentDocumentId?: string;
  }];
}

interface CreateResult {
  id: string;
  success: boolean;
  errors: string[];
  name: string;
  message: string;
}

interface CustomLabel {
  fullName: string;
  value: string;
  protected: boolean;
  categories?: string;
  shortDescription?: string;
  language?: string;
}

interface WaveDataset {
  name: string;
  currentVersionId: string;
  createdBy: {
    name: string;
  };
  datasetType: string;
  id: string;
}

interface WaveDatasetVersion {

  xmdMain: {
    dates: [
      {
        alias: string;
        fields: {
          fullField: string;
        }
      }
    ],
    dimensions: [
      {
        field: string;
      }
    ],
    measures: [
      {
        field: string;
      }
    ]
  };
}

interface WaveDataSetListResponse {
  datasets: WaveDataset[];
}

interface CDCEvent {
  schema: string;
  payload: {
    ChangeEventHeader: {
      entityName: string;
      changeType: string;
      recordIds: string[];
    }
  };
  event: {
    replayId: number
  };
}

export { 
  SObjectResponse, 
  ToolingLayoutResponse,
  SObjectLayoutResponse,
  QueryResponse, 
  CreateResult, 
  CustomLabel, 
  WaveDataSetListResponse, 
  WaveDatasetVersion, 
  CDCEvent };
