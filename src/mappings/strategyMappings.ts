import { log } from '@graphprotocol/graph-ts';
import {
  Harvested as HarvestedEvent,
  Cloned as ClonedEvent,
  SetHealthCheckCall,
  SetDoHealthCheckCall,
} from '../../generated/templates/Vault/Strategy';
import * as strategyLibrary from '../utils/strategy/strategy';
import {
  getOrCreateTransactionFromCall,
  getOrCreateTransactionFromEvent,
} from '../utils/transaction';
import { booleanToString } from '../utils/commons';

export function handleSetHealthCheck(call: SetHealthCheckCall): void {
  let strategyAddress = call.to;
  let txHash = call.transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Handle set health check {} in strategy {} and TX hash {}',
    [
      call.inputs._healthCheck.toHexString(),
      strategyAddress.toHexString(),
      txHash,
    ]
  );
  let transaction = getOrCreateTransactionFromCall(call, 'SetHealthCheck');
  strategyLibrary.healthCheckSet(
    strategyAddress,
    call.inputs._healthCheck,
    transaction
  );
}

export function handleSetDoHealthCheck(call: SetDoHealthCheckCall): void {
  let strategyAddress = call.to;
  let txHash = call.transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Handle set do health check {} in strategy {} and TX hash {}',
    [
      booleanToString(call.inputs._doHealthCheck),
      strategyAddress.toHexString(),
      txHash,
    ]
  );
  let transaction = getOrCreateTransactionFromCall(call, 'SetDoHealthCheck');
  strategyLibrary.doHealthCheckSet(
    strategyAddress,
    call.inputs._doHealthCheck,
    transaction
  );
}

export function handleHarvested(event: HarvestedEvent): void {
  let contractAddress = event.address;
  let txHash = event.transaction.hash.toHexString();
  log.info(
    '[Strategy Mapping] Handle harvested in strategy {} and TX hash {}',
    [contractAddress.toHexString(), txHash]
  );
  let ethTransaction = getOrCreateTransactionFromEvent(event, 'Harvested');
  strategyLibrary.harvest(
    event.transaction.from,
    contractAddress,
    event.block.timestamp,
    event.block.number,
    event.transaction.hash,
    event.transaction.index,
    event.params.profit,
    event.params.loss,
    event.params.debtPayment,
    event.params.debtOutstanding,
    ethTransaction
  );
}

export function handleCloned(event: ClonedEvent): void {
  let txHash = event.transaction.hash.toHexString();

  log.info('StrategyCloned txHash {} event.transaction.from {}', [
    event.transaction.from.toHexString(),
    txHash,
  ]);
  log.info('StrategyCloned txHash {} event.transaction.to {}', [
    event.transaction.to.toHexString(),
    txHash,
  ]);
  log.info('StrategyCloned txHash {} event.transaction.input {}', [
    event.transaction.input.toHexString(),
    txHash,
  ]);
  log.info('StrategyCloned txHash {} event.address {}', [
    event.address.toHexString(),
    txHash,
  ]);
  log.info('StrategyCloned txHash {} event.params.clone {}', [
    event.params.clone.toHexString(),
    txHash,
  ]);

  let clonedStrategyAddress = event.params.clone;
  let strategyAddress = event.address;
  log.info('[Strategy Mapping] Handle cloned strategy {} and TX hash {}', [
    clonedStrategyAddress.toHexString(),
    txHash,
  ]);
  let ethTransaction = getOrCreateTransactionFromEvent(event, 'StrategyCloned');
  strategyLibrary.strategyCloned(
    clonedStrategyAddress,
    strategyAddress,
    ethTransaction
  );
}
