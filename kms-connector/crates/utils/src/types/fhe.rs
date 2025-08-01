use alloy::{
    dyn_abi::DynSolValue,
    hex,
    primitives::{Bytes, U256, Uint},
};
use anyhow::anyhow;
use kms_grpc::kms::v1::TypedPlaintext;
use tfhe::FheTypes;
use tracing::error;

/// Extracts the FHE type from handle bytes.
pub fn extract_fhe_type_from_handle(bytes: &[u8]) -> anyhow::Result<FheTypes> {
    // Format: keccak256(keccak256(bundleCiphertext)+index)[0:29] + index + type + version
    // - Last byte (31): Version (currently 0)
    // - Second-to-last byte (30): FHE Type
    // - Third-to-last byte (29): Handle index
    // - Rest (0-28): Hash data
    if bytes.len() >= 32 {
        let type_byte = bytes[30]; // FHE type is at index 30
        FheTypes::try_from(type_byte as i32).map_err(anyhow::Error::from)
    } else {
        Err(anyhow!(
            "Handle too short: {} bytes, expected 32 bytes",
            bytes.len()
        ))
    }
}

/// Converts a U256 request ID to a valid hex format that KMS Core expects.
///
/// The KMS Core expects a hex string that decodes to exactly 32 bytes.
pub fn format_request_id(request_id: U256) -> String {
    // Convert U256 to big-endian bytes
    let bytes = request_id.to_be_bytes::<32>();
    // Encode as hex string
    hex::encode(bytes)
}

/// ABI encodes a list of typed plaintexts into a single byte vector for Ethereum compatibility.
///
/// This follows the encoding pattern used in the JavaScript version for decrypted results.
pub fn abi_encode_plaintexts(ptxts: &[TypedPlaintext]) -> Bytes {
    let mut results: Vec<DynSolValue> = Vec::new();
    results.push(DynSolValue::Uint(U256::from(42), 256)); // requestID placeholder

    for clear_text in ptxts.iter() {
        if let Ok(fhe_type) = clear_text.fhe_type() {
            match fhe_type {
                FheTypes::Uint512 => {
                    if clear_text.bytes.len() != 64 {
                        error!(
                            "Invalid length for Euint512: expected 64, got {}",
                            clear_text.bytes.len()
                        );
                        results.push(DynSolValue::Bytes(vec![0u8; 64]));
                    } else {
                        let arr: [u8; 64] = match clear_text.bytes.as_slice().try_into() {
                            Ok(arr) => arr,
                            Err(e) => {
                                error!("Failed to convert bytes to array for Euint512: {}", e);
                                [0u8; 64]
                            }
                        };
                        let value = Uint::<512, 8>::from_le_bytes(arr);
                        let bytes: [u8; 64] = value.to_be_bytes();
                        results.push(DynSolValue::Bytes(bytes.to_vec()));
                    }
                }
                FheTypes::Uint1024 => {
                    if clear_text.bytes.len() != 128 {
                        error!(
                            "Invalid length for Euint1024: expected 128, got {}",
                            clear_text.bytes.len()
                        );
                        results.push(DynSolValue::Bytes(vec![0u8; 128]));
                    } else {
                        let arr: [u8; 128] = match clear_text.bytes.as_slice().try_into() {
                            Ok(arr) => arr,
                            Err(e) => {
                                error!("Failed to convert bytes to array for Euint1024: {}", e);
                                [0u8; 128]
                            }
                        };
                        let value = Uint::<1024, 16>::from_le_bytes(arr);
                        let bytes: [u8; 128] = value.to_be_bytes();
                        results.push(DynSolValue::Bytes(bytes.to_vec()));
                    }
                }
                FheTypes::Uint2048 => {
                    if clear_text.bytes.len() != 256 {
                        error!(
                            "Invalid length for Euint2048: expected 256, got {}",
                            clear_text.bytes.len()
                        );
                        results.push(DynSolValue::Bytes(vec![0u8; 256]));
                    } else {
                        let arr: [u8; 256] = match clear_text.bytes.as_slice().try_into() {
                            Ok(arr) => arr,
                            Err(e) => {
                                error!("Failed to convert bytes to array for Euint2048: {}", e);
                                [0u8; 256]
                            }
                        };
                        let value = Uint::<2048, 32>::from_le_bytes(arr);
                        let bytes: [u8; 256] = value.to_be_bytes();
                        results.push(DynSolValue::Bytes(bytes.to_vec()));
                    }
                }
                _ => {
                    // For other types, convert to U256
                    if clear_text.bytes.len() > 32 {
                        error!(
                            "Byte length too large for U256: got {}, max is 32",
                            clear_text.bytes.len()
                        );
                        results.push(DynSolValue::Uint(U256::from(0), 256));
                    } else {
                        // Pad the bytes to 32 bytes for U256 (assuming little-endian input)
                        let mut padded = [0u8; 32];
                        padded[..clear_text.bytes.len()].copy_from_slice(&clear_text.bytes);
                        let value = U256::from_le_bytes(padded);
                        results.push(DynSolValue::Uint(value, 256));
                    }
                }
            }
        }
    }

    results.push(DynSolValue::Array(vec![])); // signatures placeholder

    let data = DynSolValue::Tuple(results).abi_encode_params();
    let decrypted_result = data[32..data.len() - 32].to_vec(); // remove placeholder corresponding to requestID and signatures
    Bytes::from(decrypted_result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_js_compatibility() {
        let res = "0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fffffffffffffff0";
        let plaintexts = [TypedPlaintext::from_u512(18446744073709551600_u64.into())];
        let rust_result = abi_encode_plaintexts(&plaintexts);
        let rust_hex = format!("0x{}", hex::encode(&rust_result));
        assert_eq!(rust_hex, res);
    }

    #[test]
    fn test_js_compatibility_multiple() {
        let res = "0x0000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000380000000000000000000000000000000000000000000000000000000000000013000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e0";
        let plaintexts = [
            TypedPlaintext::from_u16(22_u16),         // type 3 (uint256)
            TypedPlaintext::from_u32(42_u32),         // type 4 (uint256)
            TypedPlaintext::from_u64(56_u64),         // type 5 (uint256)
            TypedPlaintext::from_u128(19_u128),       // type 6 (uint256)
            TypedPlaintext::from_u160(32_u64.into()), // type 7 (uint256)
        ];
        let rust_result = abi_encode_plaintexts(&plaintexts);
        let rust_hex = format!("0x{}", hex::encode(&rust_result));
        assert_eq!(rust_hex, res);
    }

    #[test]
    fn test_js_compatibility_mixed_types() {
        let res = "0x00000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000002a000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fffffffffffffff000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000038000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013";
        let plaintexts = [
            TypedPlaintext::from_u512(18446744073709551600_u64.into()), // type 9 (bytes)
            TypedPlaintext::from_u64(42_u64),                           // type 5 (uint256)
            TypedPlaintext::from_u1024(56_u64.into()),                  // type 10 (bytes)
            TypedPlaintext::from_u2048(19_u64.into()),                  // type 11 (bytes)
            TypedPlaintext::from_u32(32_u32),                           // type 4 (uint256)
        ];
        let rust_result = abi_encode_plaintexts(&plaintexts);
        let rust_hex = format!("0x{}", hex::encode(&rust_result));
        assert_eq!(rust_hex, res);
    }
}
