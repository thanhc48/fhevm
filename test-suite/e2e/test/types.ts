import type { FhevmInstance } from '@zama-fhe/relayer-sdk/node';

import { EncryptedERC20, Rand } from '../types';
import { FheType } from './common';
import type { Signers } from './signers';

declare module 'mocha' {
  export interface Context {
    signers: Signers;
    contractAddress: string;
    instances: FhevmInstances;
    erc20: EncryptedERC20;
    rand: Rand;
  }
}

export interface FhevmInstances {
  alice: FhevmInstance;
  bob: FhevmInstance;
  carol: FhevmInstance;
  dave: FhevmInstance;
  eve: FhevmInstance;
}

/**
 * A constant array containing all Fully Homomorphic Encryption (FHE) types.
 * Each type is represented as an object with the following properties:
 *
 * - `type`: The name of the FHE type.
 * - `value`: A unique numeric identifier for the FHE type.
 * - `supportedOperators`: An array of strings representing the operators supported by the FHE type.
 * - `bitLength`: The bit length of the FHE type.
 * - `clearMatchingType`: The corresponding clear (non-encrypted) type in Solidity.
 * - `aliases`: An optional array of alias types that are associated with this FHE type.
 *
 * The FHE types included that are currently implemented in the Solidity code generator are:
 *
 * - `Bool`: Boolean type with a bit length of 1.
 * - `Uint8`: Unsigned integer type with a bit length of 8.
 * - `Uint16`: Unsigned integer type with a bit length of 16.
 * - `Uint32`: Unsigned integer type with a bit length of 32.
 * - `Uint64`: Unsigned integer type with a bit length of 64.
 * - `Uint128`: Unsigned integer type with a bit length of 128.
 * - `Uint160`: Unsigned integer type with a bit length of 160.
 * - `Uint256`: Unsigned integer type with a bit length of 256.
 * - `Uint512`: Unsigned integer type with a bit length of 512.
 * - `Uint1024`: Unsigned integer type with a bit length of 1024.
 * - `Uint2048`: Unsigned integer type with a bit length of 2048.
 */
export const ALL_FHE_TYPES: FheType[] = [
  {
    type: 'Bool',
    value: 0,
    supportedOperators: ['and', 'or', 'xor', 'eq', 'ne', 'not', 'select', 'rand'],
    bitLength: 2,
    clearMatchingType: 'bool',
  },
  {
    type: 'Uint4',
    value: 1,
    supportedOperators: [],
    bitLength: 4,
    clearMatchingType: 'uint8',
  },
  {
    type: 'Uint8',
    value: 2,
    supportedOperators: [
      'add',
      'sub',
      'mul',
      'div',
      'rem',
      'and',
      'or',
      'xor',
      'shl',
      'shr',
      'rotl',
      'rotr',
      'eq',
      'ne',
      'ge',
      'gt',
      'le',
      'lt',
      'min',
      'max',
      'neg',
      'not',
      'select',
      'rand',
      'randBounded',
    ],
    bitLength: 8,
    clearMatchingType: 'uint8',
    aliases: [
      {
        type: 'Bytes1',
        supportedOperators: [],
        clearMatchingType: 'bytes1',
      },
    ],
  },
  {
    type: 'Uint16',
    value: 3,
    supportedOperators: [
      'add',
      'sub',
      'mul',
      'div',
      'rem',
      'and',
      'or',
      'xor',
      'shl',
      'shr',
      'rotl',
      'rotr',
      'eq',
      'ne',
      'ge',
      'gt',
      'le',
      'lt',
      'min',
      'max',
      'neg',
      'not',
      'select',
      'rand',
      'randBounded',
    ],
    bitLength: 16,
    clearMatchingType: 'uint16',
    aliases: [
      {
        type: 'Bytes2',
        supportedOperators: [],
        clearMatchingType: 'bytes2',
      },
    ],
  },
  {
    type: 'Uint32',
    value: 4,
    supportedOperators: [
      'add',
      'sub',
      'mul',
      'div',
      'rem',
      'and',
      'or',
      'xor',
      'shl',
      'shr',
      'rotl',
      'rotr',
      'eq',
      'ne',
      'ge',
      'gt',
      'le',
      'lt',
      'min',
      'max',
      'neg',
      'not',
      'select',
      'rand',
      'randBounded',
    ],
    bitLength: 32,
    clearMatchingType: 'uint32',
    aliases: [
      {
        type: 'Bytes4',
        supportedOperators: [],
        clearMatchingType: '',
      },
    ],
  },
  {
    type: 'Uint64',
    value: 5,
    supportedOperators: [
      'add',
      'sub',
      'mul',
      'div',
      'rem',
      'and',
      'or',
      'xor',
      'shl',
      'shr',
      'rotl',
      'rotr',
      'eq',
      'ne',
      'ge',
      'gt',
      'le',
      'lt',
      'min',
      'max',
      'neg',
      'not',
      'select',
      'rand',
      'randBounded',
    ],
    bitLength: 64,
    clearMatchingType: 'uint64',
    aliases: [
      {
        type: 'Bytes8',
        supportedOperators: [],
        clearMatchingType: 'bytes8',
      },
    ],
  },
  {
    type: 'Uint128',
    value: 6,
    supportedOperators: [
      'add',
      'sub',
      'mul',
      'div',
      'rem',
      'and',
      'or',
      'xor',
      'shl',
      'shr',
      'rotl',
      'rotr',
      'eq',
      'ne',
      'ge',
      'gt',
      'le',
      'lt',
      'min',
      'max',
      'neg',
      'not',
      'select',
      'rand',
      'randBounded',
    ],
    bitLength: 128,
    clearMatchingType: 'uint128',
    aliases: [
      {
        type: 'Bytes16',
        supportedOperators: [],
        clearMatchingType: 'bytes16',
      },
    ],
  },
  {
    type: 'Uint160',
    value: 7,
    supportedOperators: [],
    bitLength: 160,
    clearMatchingType: 'uint160',
    aliases: [
      {
        type: 'Address',
        supportedOperators: ['eq', 'ne', 'select'],
        clearMatchingType: 'address',
      },
      {
        type: 'Bytes20',
        supportedOperators: [],
        clearMatchingType: 'bytes20',
      },
    ],
  },
  {
    type: 'Uint256',
    value: 8,
    supportedOperators: [
      'and',
      'or',
      'xor',
      'shl',
      'shr',
      'rotl',
      'rotr',
      'eq',
      'ne',
      'neg',
      'not',
      'select',
      'rand',
      'randBounded',
    ],
    bitLength: 256,
    clearMatchingType: 'uint256',
    aliases: [
      {
        type: 'Bytes32',
        supportedOperators: [],
        clearMatchingType: 'bytes32',
      },
    ],
  },
  {
    type: 'Uint512',
    value: 9,
    supportedOperators: [],
    bitLength: 512,
    clearMatchingType: 'bytes memory',
    aliases: [
      {
        type: 'Bytes64',
        supportedOperators: ['eq', 'ne', 'select', 'rand'],
        clearMatchingType: '',
      },
    ],
  },
  {
    type: 'Uint1024',
    value: 10,
    supportedOperators: [],
    bitLength: 1024,
    clearMatchingType: 'bytes memory',
    aliases: [
      {
        type: 'Bytes128',
        supportedOperators: ['eq', 'ne', 'select', 'rand'],
        clearMatchingType: '',
      },
    ],
  },
  {
    type: 'Uint2048',
    value: 11,
    supportedOperators: [],
    bitLength: 2048,
    clearMatchingType: 'bytes memory',
    aliases: [
      {
        type: 'Bytes256',
        supportedOperators: ['eq', 'ne', 'select', 'rand'],
        clearMatchingType: '',
      },
    ],
  },
  {
    type: 'Uint2',
    value: 12,
    supportedOperators: [],
    bitLength: 2,
    clearMatchingType: 'uint8',
  },
  {
    type: 'Uint6',
    value: 13,
    supportedOperators: [],
    bitLength: 6,
    clearMatchingType: 'uint8',
  },
  {
    type: 'Uint10',
    value: 14,
    supportedOperators: [],
    bitLength: 10,
    clearMatchingType: 'uint16',
  },
  {
    type: 'Uint12',
    value: 15,
    supportedOperators: [],
    bitLength: 12,
    clearMatchingType: 'uint16',
  },
  {
    type: 'Uint14',
    value: 16,
    supportedOperators: [],
    bitLength: 14,
    clearMatchingType: 'uint16',
  },
  {
    type: 'Int2',
    value: 17,
    supportedOperators: [],
    bitLength: 2,
    clearMatchingType: 'int8',
  },
  {
    type: 'Int4',
    value: 18,
    supportedOperators: [],
    bitLength: 4,
    clearMatchingType: 'int8',
  },
  {
    type: 'Int6',
    value: 19,
    supportedOperators: [],
    bitLength: 6,
    clearMatchingType: 'int8',
  },
  {
    type: 'Int8',
    value: 20,
    supportedOperators: [],
    bitLength: 8,
    clearMatchingType: 'int8',
  },
  {
    type: 'Int10',
    value: 21,
    supportedOperators: [],
    bitLength: 10,
    clearMatchingType: 'int16',
  },
  {
    type: 'Int12',
    value: 22,
    supportedOperators: [],
    bitLength: 12,
    clearMatchingType: 'int16',
  },
  {
    type: 'Int14',
    value: 23,
    supportedOperators: [],
    bitLength: 14,
    clearMatchingType: 'int16',
  },
  {
    type: 'Int16',
    value: 24,
    supportedOperators: [],
    bitLength: 16,
    clearMatchingType: 'int16',
  },
  {
    type: 'Int32',
    value: 25,
    supportedOperators: [],
    bitLength: 32,
    clearMatchingType: 'int32',
  },
  {
    type: 'Int64',
    value: 26,
    supportedOperators: [],
    bitLength: 64,
    clearMatchingType: 'int64',
  },
  {
    type: 'Int128',
    value: 27,
    supportedOperators: [],
    bitLength: 128,
    clearMatchingType: 'int128',
  },
  {
    type: 'Int160',
    value: 28,
    supportedOperators: [],
    bitLength: 160,
    clearMatchingType: 'int160',
  },
  {
    type: 'Int256',
    value: 29,
    supportedOperators: [],
    bitLength: 256,
    clearMatchingType: 'int256',
  },
  {
    type: 'AsciiString',
    value: 30,
    supportedOperators: [],
    bitLength: 0,
    clearMatchingType: 'string memory',
  },
  {
    type: 'Int512',
    value: 31,
    supportedOperators: [],
    bitLength: 512,
    clearMatchingType: 'bytes memory',
  },
  {
    type: 'Int1024',
    value: 32,
    supportedOperators: [],
    bitLength: 1024,
    clearMatchingType: 'bytes memory',
  },
  {
    type: 'Int2048',
    value: 33,
    supportedOperators: [],
    bitLength: 2048,
    clearMatchingType: 'bytes memory',
  },
  {
    type: 'Uint24',
    value: 34,
    supportedOperators: [],
    bitLength: 24,
    clearMatchingType: 'uint24',
    aliases: [
      {
        type: 'Bytes3',
        supportedOperators: [],
        clearMatchingType: 'bytes3',
      },
    ],
  },
  {
    type: 'Uint40',
    value: 35,
    supportedOperators: [],
    bitLength: 40,
    clearMatchingType: 'uint40',
    aliases: [
      {
        type: 'Bytes5',
        supportedOperators: [],
        clearMatchingType: 'bytes5',
      },
    ],
  },
  {
    type: 'Uint48',
    value: 36,
    supportedOperators: [],
    bitLength: 48,
    clearMatchingType: 'uint48',
    aliases: [
      {
        type: 'Bytes6',
        supportedOperators: [],
        clearMatchingType: 'bytes6',
      },
    ],
  },
  {
    type: 'Uint56',
    value: 37,
    supportedOperators: [],
    bitLength: 56,
    clearMatchingType: 'uint56',
    aliases: [
      {
        type: 'Bytes7',
        supportedOperators: [],
        clearMatchingType: '',
      },
    ],
  },
  {
    type: 'Uint72',
    value: 38,
    supportedOperators: [],
    bitLength: 72,
    clearMatchingType: 'uint72',
    aliases: [
      {
        type: 'Bytes9',
        supportedOperators: [],
        clearMatchingType: 'bytes9',
      },
    ],
  },
  {
    type: 'Uint80',
    value: 39,
    supportedOperators: [],
    bitLength: 80,
    clearMatchingType: 'uint80',
    aliases: [
      {
        type: 'Bytes10',
        supportedOperators: [],
        clearMatchingType: 'bytes10',
      },
    ],
  },
  {
    type: 'Uint88',
    value: 40,
    supportedOperators: [],
    bitLength: 88,
    clearMatchingType: 'uint88',
    aliases: [
      {
        type: 'Bytes11',
        supportedOperators: [],
        clearMatchingType: 'bytes11',
      },
    ],
  },
  {
    type: 'Uint96',
    value: 41,
    supportedOperators: [],
    bitLength: 96,
    clearMatchingType: 'uint96',
    aliases: [
      {
        type: 'Bytes12',
        supportedOperators: [],
        clearMatchingType: 'bytes12',
      },
    ],
  },
  {
    type: 'Uint104',
    value: 42,
    supportedOperators: [],
    bitLength: 104,
    clearMatchingType: 'uint104',
    aliases: [
      {
        type: 'Bytes13',
        supportedOperators: [],
        clearMatchingType: 'bytes13',
      },
    ],
  },
  {
    type: 'Uint112',
    value: 43,
    supportedOperators: [],
    bitLength: 112,
    clearMatchingType: 'uint112',
    aliases: [
      {
        type: 'Bytes14',
        supportedOperators: [],
        clearMatchingType: 'bytes14',
      },
    ],
  },
  {
    type: 'Uint120',
    value: 44,
    supportedOperators: [],
    bitLength: 120,
    clearMatchingType: 'uint120',
    aliases: [
      {
        type: 'Bytes15',
        supportedOperators: [],
        clearMatchingType: 'bytes15',
      },
    ],
  },
  {
    type: 'Uint136',
    value: 45,
    supportedOperators: [],
    bitLength: 136,
    clearMatchingType: 'uint136',
    aliases: [
      {
        type: 'Bytes17',
        supportedOperators: [],
        clearMatchingType: 'bytes17',
      },
    ],
  },
  {
    type: 'Uint144',
    value: 46,
    supportedOperators: [],
    bitLength: 144,
    clearMatchingType: 'uint144',
    aliases: [
      {
        type: 'Bytes18',
        supportedOperators: [],
        clearMatchingType: 'bytes18',
      },
    ],
  },
  {
    type: 'Uint152',
    value: 47,
    supportedOperators: [],
    bitLength: 152,
    clearMatchingType: 'uint152',
    aliases: [
      {
        type: 'Bytes19',
        supportedOperators: [],
        clearMatchingType: 'bytes19',
      },
    ],
  },
  {
    type: 'Uint168',
    value: 48,
    supportedOperators: [],
    bitLength: 168,
    clearMatchingType: 'uint168',
    aliases: [
      {
        type: 'Bytes21',
        supportedOperators: [],
        clearMatchingType: 'bytes21',
      },
    ],
  },
  {
    type: 'Uint176',
    value: 49,
    supportedOperators: [],
    bitLength: 176,
    clearMatchingType: 'uint176',
    aliases: [
      {
        type: 'Bytes22',
        supportedOperators: [],
        clearMatchingType: 'bytes22',
      },
    ],
  },
  {
    type: 'Uint184',
    value: 50,
    supportedOperators: [],
    bitLength: 184,
    clearMatchingType: 'uint184',
    aliases: [
      {
        type: 'Bytes23',
        supportedOperators: [],
        clearMatchingType: 'bytes23',
      },
    ],
  },
  {
    type: 'Uint192',
    value: 51,
    supportedOperators: [],
    bitLength: 192,
    clearMatchingType: 'uint192',
    aliases: [
      {
        type: 'Bytes24',
        supportedOperators: [],
        clearMatchingType: '24',
      },
    ],
  },
  {
    type: 'Uint200',
    value: 52,
    supportedOperators: [],
    bitLength: 200,
    clearMatchingType: 'uint200',
    aliases: [
      {
        type: 'Bytes25',
        supportedOperators: [],
        clearMatchingType: '25',
      },
    ],
  },
  {
    type: 'Uint208',
    value: 53,
    supportedOperators: [],
    bitLength: 208,
    clearMatchingType: 'uint208',
    aliases: [
      {
        type: 'Bytes26',
        supportedOperators: [],
        clearMatchingType: '26',
      },
    ],
  },
  {
    type: 'Uint216',
    value: 54,
    supportedOperators: [],
    bitLength: 216,
    clearMatchingType: 'uint216',
    aliases: [
      {
        type: 'Bytes27',
        supportedOperators: [],
        clearMatchingType: '27',
      },
    ],
  },
  {
    type: 'Uint224',
    value: 55,
    supportedOperators: [],
    bitLength: 224,
    clearMatchingType: 'uint224',
    aliases: [
      {
        type: 'Bytes28',
        supportedOperators: [],
        clearMatchingType: '28',
      },
    ],
  },
  {
    type: 'Uint232',
    value: 56,
    supportedOperators: [],
    bitLength: 232,
    clearMatchingType: 'uint232',
    aliases: [
      {
        type: 'Bytes29',
        supportedOperators: [],
        clearMatchingType: 'bytes29',
      },
    ],
  },
  {
    type: 'Uint240',
    value: 57,
    supportedOperators: [],
    bitLength: 240,
    clearMatchingType: 'uint240',
    aliases: [
      {
        type: 'Bytes30',
        supportedOperators: [],
        clearMatchingType: 'bytes30',
      },
    ],
  },
  {
    type: 'Uint248',
    value: 58,
    supportedOperators: [],
    bitLength: 248,
    clearMatchingType: 'uint248',
    aliases: [
      {
        type: 'Bytes31',
        supportedOperators: [],
        clearMatchingType: 'bytes31',
      },
    ],
  },
  {
    type: 'Int24',
    value: 59,
    supportedOperators: [],
    bitLength: 24,
    clearMatchingType: 'int24',
  },
  {
    type: 'Int40',
    value: 60,
    supportedOperators: [],
    bitLength: 40,
    clearMatchingType: 'int40',
  },
  {
    type: 'Int48',
    value: 61,
    supportedOperators: [],
    bitLength: 48,
    clearMatchingType: 'int48',
  },
  {
    type: 'Int56',
    value: 62,
    supportedOperators: [],
    bitLength: 56,
    clearMatchingType: 'int56',
  },
  {
    type: 'Int72',
    value: 63,
    supportedOperators: [],
    bitLength: 72,
    clearMatchingType: 'int72',
  },
  {
    type: 'Int80',
    value: 64,
    supportedOperators: [],
    bitLength: 80,
    clearMatchingType: 'int80',
  },
  {
    type: 'Int88',
    value: 65,
    supportedOperators: [],
    bitLength: 88,
    clearMatchingType: 'int88',
  },
  {
    type: 'Int96',
    value: 66,
    supportedOperators: [],
    bitLength: 96,
    clearMatchingType: 'int96',
  },
  {
    type: 'Int104',
    value: 67,
    supportedOperators: [],
    bitLength: 104,
    clearMatchingType: 'int104',
  },
  {
    type: 'Int112',
    value: 68,
    supportedOperators: [],
    bitLength: 112,
    clearMatchingType: 'int112',
  },
  {
    type: 'Int120',
    value: 69,
    supportedOperators: [],
    bitLength: 120,
    clearMatchingType: 'int120',
  },
  {
    type: 'Int136',
    value: 70,
    supportedOperators: [],
    bitLength: 136,
    clearMatchingType: 'int136',
  },
  {
    type: 'Int144',
    value: 71,
    supportedOperators: [],
    bitLength: 144,
    clearMatchingType: 'int144',
  },
  {
    type: 'Int152',
    value: 72,
    supportedOperators: [],
    bitLength: 152,
    clearMatchingType: 'int152',
  },
  {
    type: 'Int168',
    value: 73,
    supportedOperators: [],
    bitLength: 168,
    clearMatchingType: 'int168',
  },
  {
    type: 'Int176',
    value: 74,
    supportedOperators: [],
    bitLength: 176,
    clearMatchingType: 'int176',
  },
  {
    type: 'Int184',
    value: 75,
    supportedOperators: [],
    bitLength: 184,
    clearMatchingType: 'int184',
  },
  {
    type: 'Int192',
    value: 76,
    supportedOperators: [],
    bitLength: 192,
    clearMatchingType: 'int192',
  },
  {
    type: 'Int200',
    value: 77,
    supportedOperators: [],
    bitLength: 200,
    clearMatchingType: 'int200',
  },
  {
    type: 'Int208',
    value: 78,
    supportedOperators: [],
    bitLength: 208,
    clearMatchingType: 'int208',
  },
  {
    type: 'Int216',
    value: 79,
    supportedOperators: [],
    bitLength: 216,
    clearMatchingType: 'int216',
  },
  {
    type: 'Int224',
    value: 80,
    supportedOperators: [],
    bitLength: 224,
    clearMatchingType: 'int224',
  },
  {
    type: 'Int232',
    value: 81,
    supportedOperators: [],
    bitLength: 232,
    clearMatchingType: 'int232',
  },
  {
    type: 'Int240',
    value: 82,
    supportedOperators: [],
    bitLength: 240,
    clearMatchingType: 'int240',
  },
  {
    type: 'Int248',
    value: 83,
    supportedOperators: [],
    bitLength: 248,
    clearMatchingType: 'int248',
  },
];
