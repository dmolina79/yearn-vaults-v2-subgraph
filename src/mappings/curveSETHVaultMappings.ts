import { BigInt, log } from '@graphprotocol/graph-ts';
import {
  AddStrategy1Call as AddStrategyV2Call,
  Vault as VaultContract,
  UpdatePerformanceFee as UpdatePerformanceFeeEvent,
  UpdateManagementFee as UpdateManagementFeeEvent,
} from '../../generated/Registry/Vault';
import { BIGINT_ZERO } from '../utils/constants';
import * as strategyLibrary from '../utils/strategy/strategy';
import {
  getOrCreateTransactionFromCall,
  getOrCreateTransactionFromEvent,
} from '../utils/transaction';
import * as vaultLibrary from '../utils/vault/vault';

/**
 * The strategy for this vault wasn't processed  using the registry because the strategy was added before the vault was registered.

  https://etherscan.io/token/0x986b4aff588a109c09b50a03f42e4110e29d353f (eCRV/yveCRV)

  AddStrategy (#11870118): https://etherscan.io/tx/0xaf8b9cb986a216e5191b0d704ee208dd5d9e111911c6b63d90cc406bb76f3d19
  Regsitered (#11881934): https://etherscan.io/tx/0xc62c06623c4ccdefd360e0c197107c97d6c95be0cef64125043c2c9349879dfb

  This custom handler, handle the new strategies in that block range. 
 */
export function handleAddStrategyV2(call: AddStrategyV2Call): void {
  if (vaultLibrary.isVault(call.to) && vaultLibrary.isVault(call.from)) {
    log.warning(
      'CurveSETHVault_AddStrategyV2(...) - TX {} - Call to {} and call from {} are vaults (minimal proxy). Not processing addStrategy tx.',
      [
        call.transaction.hash.toHexString(),
        call.to.toHexString(),
        call.from.toHexString(),
      ]
    );
    return;
  }

  if (call.block.number.gt(BigInt.fromI32(11881933))) {
    log.warning(
      'CurveSETHVault_AddStrategyV2(...) - TX {} - Block number {}. Not processing addStrategy tx.',
      [
        call.transaction.hash.toHexString(),
        call.block.number.toString(),
        call.to.toHexString(),
        call.from.toHexString(),
      ]
    );
    return;
  }
  let ethTransaction = getOrCreateTransactionFromCall(
    call,
    'CurveSETHVault_AddStrategyV2Call'
  );

  strategyLibrary.createAndGet(
    ethTransaction.id,
    call.inputs.strategy,
    call.to,
    call.inputs.debtRatio,
    BIGINT_ZERO,
    call.inputs.minDebtPerHarvest,
    call.inputs.maxDebtPerHarvest,
    call.inputs.performanceFee,
    ethTransaction
  );
}

export function handleUpdatePerformanceFee(
  event: UpdatePerformanceFeeEvent
): void {
  if (event.block.number.gt(BigInt.fromI32(11881933))) {
    log.warning(
      'CurveSETHVault_UpdatePerformanceFeeEvent - Not processing performance fee update on vault {} on block {}',
      [event.address.toHexString(), event.block.number.toString()]
    );
    return;
  }
  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'UpdatePerformanceFee'
  );

  let vaultContract = VaultContract.bind(event.address);

  vaultLibrary.performanceFeeUpdated(
    event.address,
    ethTransaction,
    vaultContract,
    event.params.performanceFee
  );
}

export function handleUpdateManagementFee(
  event: UpdateManagementFeeEvent
): void {
  if (event.block.number.gt(BigInt.fromI32(11881933))) {
    log.warning(
      'CurveSETHVault_UpdateManagementFeeEvent - Not processing performance fee update on vault {} on block {}',
      [event.address.toHexString(), event.block.number.toString()]
    );
    return;
  }
  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'UpdateManagementFee'
  );

  let vaultContract = VaultContract.bind(event.address);

  vaultLibrary.managementFeeUpdated(
    event.address,
    ethTransaction,
    vaultContract,
    event.params.managementFee
  );
}
