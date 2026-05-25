import { bcs } from '@mysten/sui/bcs';
import { Transaction } from '@mysten/sui/transactions';

const tx = new Transaction();
tx.moveCall({
    target: `0x123::test::test`,
    arguments: [
        tx.pure.address("0x123")
    ]
});
console.log("Success address");
