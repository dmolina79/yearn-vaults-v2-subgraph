import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const GOVERNANCE_ADDRESS = '0xba37b002abafdd8e89a1995da52740bbc013d992';
export const USDC_ORACLE_ADDRESS = '0x83d95e0d5f402511db06817aff3f9ea88224b030';
export const DEFAULT_DECIMALS = 18;
export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);
export let BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
export let MAX_UINT = BigInt.fromI32(2).times(BigInt.fromI32(255));
export let DAYS_PER_YEAR = new BigDecimal(BigInt.fromI32(365));
export let MS_PER_DAY = new BigDecimal(BigInt.fromI32(24 * 60 * 60 * 1000));
export let MS_PER_YEAR = DAYS_PER_YEAR.times(
  new BigDecimal(BigInt.fromI32(24 * 60 * 60 * 1000))
);
export let YEARN_ENTITY_ID = '1';

export let CURVE_SETH_VAULT_END_BLOCK_CUSTOM = BigInt.fromI32(11881933);
export let YV_WBTC_VAULT_END_BLOCK_CUSTOM = BigInt.fromI32(12341475);
export let YV_LINK_VAULT_END_BLOCK_CUSTOM = BigInt.fromI32(12586056);

export const DON_T_CREATE_VAULT_TEMPLATE = false;
export const DO_CREATE_VAULT_TEMPLATE = true;

export let REGISTRY_ADDRESS_V1 = Address.fromHexString(
  '0xe15461b18ee31b7379019dc523231c57d1cbc18c'
) as Address;
export let REGISTRY_ADDRESS_V2 = Address.fromHexString(
  '0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804'
) as Address;
export const ENDORSED = 'Endorsed';
export const API_VERSION_0_4_2 = '0.4.2';
export const API_VERSION_0_3_5 = '0.3.5';
