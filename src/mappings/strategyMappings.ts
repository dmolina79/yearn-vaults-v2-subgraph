import { log } from '@graphprotocol/graph-ts';
import {
  Harvested as HarvestedEvent,
  Cloned as ClonedEvent,
} from '../../generated/templates/Vault/Strategy';
import * as strategyLibrary from '../utils/strategy/strategy';
import { getOrCreateTransactionFromEvent } from '../utils/transaction';

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
