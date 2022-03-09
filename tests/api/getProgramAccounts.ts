import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, Connection } from "@solana/web3.js";

const fetch_accounts = async () => {
  const my_wallet_addres = "FwPhEGboyg521fMhZiituX6feaCYmBptUhf61eNtwSum";
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const accounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: 165,
      },
      {
        memcmp: {
          offset: 32,
          bytes: my_wallet_addres,
        },
      },
    ],
  });

  console.log(
    `Found ${accounts.length} token accounts(s) for wallet ${my_wallet_addres}`
  );

  accounts.forEach((account, i) => {
    console.log(`Token account address ${i + 1}: ${account.pubkey.toString()}`);
    console.log(`Mint ${account.account.data["parsed"]["info"]["mint"]}`);
    console.log(
      `Amount: ${account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"]}`
    );
  });
};

fetch_accounts();
