Transaction
- Deprecated "contract" since it's the "to" parameter also. 
- Made action an optional parameter since it's wrong to only associate a transaction with an event (for example the call handlers when depositing)

VaultUpdate
- Deprecated timestamp, can be accessed by transaction relationship
- Deprecated block number, can be accessed by transaction relationship

AccountVaultPosition
- Deprecated token since it's accesible by the vault relationship 
- Deprecated shareToken since it's accesible by the vault relationship 

AccountVaultPositionUpdate
- Deprecated timestamp, can be accessed by transaction relationship
- Deprecated block number, can be accessed by transaction relationship
- Deprecated account, can be accesed by account vault position relationship

