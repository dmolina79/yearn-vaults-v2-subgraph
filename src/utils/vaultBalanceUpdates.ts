import { Address, BigInt, Bytes, ethereum as eth, log } from '@graphprotocol/graph-ts';

import { 
    Transfer, 
    VaultUpdate, 
    Vault,
    Deposit
} from '../../generated/schema';

import {
    buildId,
    buildUpdateId
} from './commons';

import { getOrCreateAccount } from './account';
import { getOrCreateVault } from './vault';
import { getOrCreateToken } from './token';
import { BIGINT_ZERO, DEFAULT_DECIMALS } from '../utils/constants';


export function getOrCreateVaultUpdate(
    vaultUpdateId: string,
    transactionHash: Bytes,
    timestamp: BigInt,
    blockNumber: BigInt,
    deposits: BigInt,
    withdrawals: BigInt, // withdrawal doesn't change
    sharesMinted: BigInt,
    sharesBurnt: BigInt, // shares burnt don't change
    vaultId: string,
    pricePerShare: BigInt,
  ): VaultUpdate {
    log.debug('[Vault Balance Updates] Get or vault update', [])
    let vault = Vault.load(vaultId)
    let latestVaultUpdate = VaultUpdate.load(vault.latestUpdate)
    let vaultUpdate = VaultUpdate.load(vaultUpdateId)

    if (vaultUpdate === null) {

      vaultUpdate = new VaultUpdate(vaultUpdateId);
    
      vaultUpdate.timestamp = timestamp
      vaultUpdate.blockNumber = blockNumber
      vaultUpdate.transaction = transactionHash.toHexString()
      vaultUpdate.vault = vault.id;
  
      // BALANCES AND SHARES
      vaultUpdate.tokensDeposited = (latestVaultUpdate) ? latestVaultUpdate.tokensDeposited.plus(deposits) : deposits;
      vaultUpdate.tokensWithdrawn = (latestVaultUpdate) ? latestVaultUpdate.tokensWithdrawn.minus(withdrawals) : withdrawals;
      vaultUpdate.sharesMinted = (latestVaultUpdate) ? latestVaultUpdate.sharesMinted.plus(sharesMinted) : sharesMinted;
      vaultUpdate.sharesBurnt = (latestVaultUpdate) ? latestVaultUpdate.sharesBurnt.minus(sharesBurnt) : sharesBurnt;
      
      // vaultUpdate.balance = deposits.minus(withdrawals);
      // vaultUpdate.shareBalance = sharesMinted.minus(sharesBurnt);
    
      // PERFORMANCE
      vaultUpdate.pricePerShare = pricePerShare;
      
      // First setup
      if (!latestVaultUpdate) {
        vaultUpdate.returnsGenerated = BIGINT_ZERO
        vaultUpdate.totalFees = BIGINT_ZERO
        vaultUpdate.managementFees = BIGINT_ZERO
        vaultUpdate.performanceFees = BIGINT_ZERO
      } else {
        // TODO: Use real data
        vaultUpdate.returnsGenerated = BIGINT_ZERO
        vaultUpdate.totalFees = BIGINT_ZERO
      }
    
      vault.historicalUpdates.push(vaultUpdate.id);
      vault.latestUpdate = vaultUpdateId
    
      vaultUpdate.save();
      vault.save();
    }
    return vaultUpdate!
  }

  export function getOrCreateDeposit(
    transactionHash: Bytes,
    transactionIndex: BigInt,
    to: Address,
    from: Address,
    inputAmount: BigInt,
    totalAssets: BigInt,
    totalSupply: BigInt,
    pricePerShare: BigInt,
    blockTimestamp: BigInt,
    blockNumber: BigInt,
  ): Deposit {
    log.debug('[Vault Balance Updates] Get or create deposit', [])
    let id = buildId(transactionHash, transactionIndex);
    let deposit = Deposit.load(id)

    if (deposit === null) {
      let vaultAddress = to;
      let account = getOrCreateAccount(from);
      let vault = getOrCreateVault(vaultAddress, false);
    
      // TODO: link this line on contract
      let sharesMinted = totalAssets.equals(BIGINT_ZERO)
        ? inputAmount
        : inputAmount.times(totalSupply).div(totalAssets);
  
      deposit = new Deposit(id)
      deposit.account = account.id
      deposit.vault = vault.id
      deposit.tokenAmount = inputAmount
      deposit.sharesMinted = sharesMinted
      deposit.transaction = transactionHash.toHexString()

      let vaultUpdateId = buildUpdateId(
        vaultAddress,
        transactionHash,
        transactionIndex,
      );
    
      getOrCreateVaultUpdate(
        vaultUpdateId,
        transactionHash,
        blockTimestamp,
        blockNumber,
        inputAmount,
        BIGINT_ZERO, // withdrawal doesn't change
        sharesMinted,
        BIGINT_ZERO, // shares burnt don't change
        vault.id,
        pricePerShare
      );

      deposit.vaultUpdate = vaultUpdateId
    
      // TODO: accountUpdate
      deposit.save();
    }

    return deposit!
  }

 export function internalMapWithdrawal(
    transactionHash:Bytes,
    transactionIndex: BigInt,
    to:Address,
    from: Address,
    inputShares: BigInt,
    totalAssets: BigInt,
    totalSupply: BigInt,
    pricePerShare: BigInt,
    blockTimestamp: BigInt,
    blockNumber: BigInt,
  ): void {
  let id = buildId(transactionHash, transactionIndex);
  let vaultAddress = to;

  let account = getOrCreateAccount(from);
  let vault = getOrCreateVault(vaultAddress, false);

  let amount = totalAssets
    .times(inputShares)
    .div(totalSupply);

   // TODO: refactor this if needed for final implementation 
  // createOperation(
  //   id,
  //   vault.id,
  //   account.id,
  //   amount,
  //   inputShares,
  //   blockTimestamp,
  //   blockNumber,
  //   'Withdrawal',
  // );

  let vaultUpdateId = buildUpdateId(
    vaultAddress,
    transactionHash,
    transactionIndex,
  );

  getOrCreateVaultUpdate(
    vaultUpdateId,
    transactionHash,
    blockTimestamp,
    blockNumber,
    // call.inputs._amount, // don't pass
    BIGINT_ZERO, // deposit doesn't change
    amount,
    // shares, // don't pass
    BIGINT_ZERO, // shares minted don't change
    inputShares,
    vault.id,
    pricePerShare,
    // earnings, // don't pass
    // withdrawalFees, // don't pass
    // performanceFees, // don't pass
  );

  // TODO: accountUpdate
}

/*
  export function mapWithdrawal(call: WithdrawCall): void {
    let id = buildId(call.transaction.hash, call.transaction.index);
    let vaultAddress = call.to;
  
    let account = getOrCreateAccount(call.from);
    let vault = getOrCreateVault(vaultAddress);
    let vaultContract = VaultContract.bind(vaultAddress);
  
    let amount = vaultContract
      .totalAssets()
      .times(call.inputs._shares)
      .div(vaultContract.totalSupply());
  
    createOperation(
      id,
      vault.id,
      account.id,
      amount,
      call.inputs._shares,
      call.block.timestamp,
      call.block.number,
      'Withdrawal',
    );
  
    let vaultUpdateId = buildUpdateId(
      vaultAddress,
      call.transaction.hash,
      call.transaction.index,
    );
  
    getOrCreateVaultUpdate(
      vaultUpdateId,
      call.block.timestamp,
      call.block.number,
      // call.inputs._amount, // don't pass
      BIGINT_ZERO, // deposit doesn't change
      amount,
      // shares, // don't pass
      BIGINT_ZERO, // shares minted don't change
      call.inputs._shares,
      vault.id,
      vaultContract.pricePerShare(),
      // earnings, // don't pass
      // withdrawalFees, // don't pass
      // performanceFees, // don't pass
    );
  
    // TODO: accountUpdate
  }
  */

 export function internalMapTransfer(
   transactionHash:Bytes,
  transactionIndex: BigInt,
  address:Address,
  from: Address,
  to: Address,
    value: BigInt,
    totalAssets: BigInt,
    totalSupply: BigInt,
    blockTimestamp: BigInt,
    blockNumber: BigInt,
  ): void {
  let id = buildId(transactionHash, transactionIndex);


  let vaultSharesToken = getOrCreateToken(address);
  let vault = getOrCreateVault(address, false);
  let sender = getOrCreateAccount(from);
  let receiver = getOrCreateAccount(to);
  

  let transfer = new Transfer(id.toString());

  transfer.from = sender.id;
  transfer.to = receiver.id;

  transfer.vault = vault.id;
  transfer.token = vault.token;
  transfer.shareToken = vaultSharesToken.id;
  // TODO: refactor this
  // transfer.shares = value;
  transfer.amount = totalAssets
    .times(value)
    .div(totalSupply);

  transfer.timestamp = blockTimestamp;
  transfer.blockNumber = blockNumber;

  // TODO: accountUpdate

  transfer.save();
}