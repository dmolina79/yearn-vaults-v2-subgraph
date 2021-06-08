import { Vault, VaultDayData } from '../../../generated/schema';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { BIGINT_ZERO } from '../constants';
import { usdcPricePerToken } from '../oracle/usdc-oracle';
import { getTimeInMillis } from '../commons';

export function updateVaultDayData(
  vault: Vault,
  tokenAddress: Address,
  timestamp: BigInt,
  pricePerShare: BigInt,
  deposited: BigInt,
  withdrawn: BigInt,
  returnsGenerated: BigInt,
  decimals: BigInt
): void {
  let timestampNum = timestamp.toI32();
  let dayID = timestampNum / 86400;
  let vaultDayID = getDayID(vault.id, dayID);

  let vaultDayData = VaultDayData.load(vaultDayID);
  if (vaultDayData === null) {
    vaultDayData = new VaultDayData(vaultDayID);
    vaultDayData.timestamp = getTimeInMillis(timestamp);
    vaultDayData.vault = vault.id;
    vaultDayData.pricePerShare = pricePerShare;
    vaultDayData.deposited = BIGINT_ZERO;
    vaultDayData.withdrawn = BIGINT_ZERO;
    vaultDayData.totalReturnsGenerated = BIGINT_ZERO;
    vaultDayData.totalReturnsGeneratedUSDC = BIGINT_ZERO;
    vaultDayData.dayReturnsGenerated = BIGINT_ZERO;
    vaultDayData.dayReturnsGeneratedUSDC = BIGINT_ZERO;
  }

  let usdcPrice = usdcPricePerToken(tokenAddress);

  vaultDayData.pricePerShare = pricePerShare;
  vaultDayData.deposited = vaultDayData.deposited.plus(deposited);
  vaultDayData.withdrawn = vaultDayData.withdrawn.plus(withdrawn);
  vaultDayData.dayReturnsGenerated = returnsGenerated;
  vaultDayData.tokenPriceUSDC = usdcPrice;

  // @ts-ignore
  let u8Decimals = u8(decimals.toI32());
  let priceDivisor = BigInt.fromI32(10).pow(u8Decimals);

  vaultDayData.dayReturnsGeneratedUSDC = returnsGenerated
    .times(usdcPrice)
    .div(priceDivisor);

  let previousVaultDayData = VaultDayData.load(getDayID(vault.id, dayID - 1));
  if (previousVaultDayData !== null) {
    vaultDayData.totalReturnsGenerated = previousVaultDayData.totalReturnsGenerated.plus(
      returnsGenerated
    );
    vaultDayData.totalReturnsGeneratedUSDC = vaultDayData.totalReturnsGenerated
      .times(usdcPrice)
      .div(priceDivisor);
  }

  vaultDayData.save();
}

function getDayID(vaultID: string, dayID: number): string {
  return (
    vaultID
      .toString()
      .concat('-')
      // @ts-ignore
      .concat(BigInt.fromI32(i32(dayID)).toString())
  );
}
