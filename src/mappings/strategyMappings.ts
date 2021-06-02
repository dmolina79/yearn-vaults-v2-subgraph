import { log } from '@graphprotocol/graph-ts';
import { Harvested as HarvestedEvent } from '../../generated/templates/Vault/Strategy';
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
