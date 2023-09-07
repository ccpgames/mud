declare const abi: [
  {
    anonymous: false;
    inputs: [
      {
        indexed: false;
        internalType: "bytes32";
        name: "table";
        type: "bytes32";
      },
      {
        indexed: false;
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      }
    ];
    name: "StoreDeleteRecord";
    type: "event";
  },
  {
    anonymous: false;
    inputs: [
      {
        indexed: false;
        internalType: "bytes32";
        name: "table";
        type: "bytes32";
      },
      {
        indexed: false;
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        indexed: false;
        internalType: "uint8";
        name: "schemaIndex";
        type: "uint8";
      },
      {
        indexed: false;
        internalType: "bytes";
        name: "data";
        type: "bytes";
      }
    ];
    name: "StoreSetField";
    type: "event";
  },
  {
    anonymous: false;
    inputs: [
      {
        indexed: false;
        internalType: "bytes32";
        name: "table";
        type: "bytes32";
      },
      {
        indexed: false;
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        indexed: false;
        internalType: "bytes";
        name: "data";
        type: "bytes";
      }
    ];
    name: "StoreSetRecord";
    type: "event";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "table";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      }
    ];
    name: "deleteRecord";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "table";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "uint8";
        name: "schemaIndex";
        type: "uint8";
      },
      {
        internalType: "uint256";
        name: "byteLengthToPop";
        type: "uint256";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      }
    ];
    name: "popFromField";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "table";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "uint8";
        name: "schemaIndex";
        type: "uint8";
      },
      {
        internalType: "bytes";
        name: "dataToPush";
        type: "bytes";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      }
    ];
    name: "pushToField";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "table";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "uint8";
        name: "schemaIndex";
        type: "uint8";
      },
      {
        internalType: "bytes";
        name: "data";
        type: "bytes";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      }
    ];
    name: "setField";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "table";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "bytes";
        name: "data";
        type: "bytes";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      }
    ];
    name: "setRecord";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  },
  {
    inputs: [
      {
        internalType: "bytes32";
        name: "table";
        type: "bytes32";
      },
      {
        internalType: "bytes32[]";
        name: "key";
        type: "bytes32[]";
      },
      {
        internalType: "uint8";
        name: "schemaIndex";
        type: "uint8";
      },
      {
        internalType: "uint256";
        name: "startByteIndex";
        type: "uint256";
      },
      {
        internalType: "bytes";
        name: "dataToSet";
        type: "bytes";
      },
      {
        internalType: "Schema";
        name: "valueSchema";
        type: "bytes32";
      }
    ];
    name: "updateInField";
    outputs: [];
    stateMutability: "nonpayable";
    type: "function";
  }
];
export default abi;
