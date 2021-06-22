import { BigInt, dataSource, log } from '@graphprotocol/graph-ts';
import {
  NewRelease as NewReleaseEvent,
  NewVault as NewVaultEvent,
  NewExperimentalVault as NewExperimentalVaultEvent,
  VaultTagged as VaultTaggedEvent,
} from '../../generated/Registry/Registry';
import { getOrCreateTransactionFromEvent } from '../utils/transaction';
import * as vaultLibrary from '../utils/vault/vault';
import * as registryLibrary from '../utils/registry/registry';
import { DO_CREATE_VAULT_TEMPLATE } from '../utils/constants';

export function handleNewRelease(event: NewReleaseEvent): void {
  let registryAddress = dataSource.address();
  log.info(
    '[Registry] NewRelease: Registry {} - ApiVersion {} - ReleaseID {} - Template {} - Sender {} TX {}',
    [
      registryAddress.toHexString(),
      event.params.api_version,
      event.params.release_id.toString(),
      event.params.template.toHexString(),
      event.transaction.from.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'Registry-FirstNewReleaseEvent'
  );
  registryLibrary.getOrCreate(registryAddress, ethTransaction);
  vaultLibrary.release(
    event.params.template,
    event.params.api_version,
    event.params.release_id,
    event
  );
}

export function handleNewVault(event: NewVaultEvent): void {
  let registryAddress = dataSource.address();
  log.info(
    '[Registry] NewVault: Registry {} - New vault {} - Sender {} - TX {}',
    [
      dataSource.address().toHexString(),
      event.params.vault.toHexString(),
      event.transaction.from.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );
  let ethTransaction = getOrCreateTransactionFromEvent(event, 'NewVaultEvent');
  let registry = registryLibrary.getOrCreate(registryAddress, ethTransaction);
  vaultLibrary.create(
    registry,
    ethTransaction,
    event.params.vault,
    'Endorsed',
    event.params.api_version,
    DO_CREATE_VAULT_TEMPLATE
  );
}

export function handleNewExperimentalVault(
  event: NewExperimentalVaultEvent
): void {
  let registryAddress = dataSource.address();
  log.info(
    '[Registry] NewExperimentalVault: Registry {} - Experimental vault {} - Sender {} - TX {}',
    [
      dataSource.address().toHexString(),
      event.params.vault.toHexString(),
      event.transaction.from.toHexString(),
      event.transaction.hash.toHexString(),
    ]
  );

  let ethTransaction = getOrCreateTransactionFromEvent(
    event,
    'NewExperimentalVault'
  );
  let registry = registryLibrary.getOrCreate(registryAddress, ethTransaction);
  vaultLibrary.create(
    registry,
    ethTransaction,
    event.params.vault,
    'Experimental',
    event.params.api_version,
    DO_CREATE_VAULT_TEMPLATE
  );
}

export function handleVaultTagged(event: VaultTaggedEvent): void {
  vaultLibrary.tag(event.params.vault, event.params.tag);
}
