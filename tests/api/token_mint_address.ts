import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, Connection } from "@solana/web3.js";

const fetch_accounts = async () => {
  const my_mint_addres = "uUqdgS7DJeBkkkcVViZVLHCGTdnzS4Kec76zGgS66X2";
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    dataSlice: {
      offset: 0,
      length: 0,
    },
    filters: [
      {
        dataSize: 165,
      },
      {
        memcmp: {
          offset: 0,
          bytes: my_mint_addres,
        },
      },
    ],
  });

  console.log(
    `Found ${accounts.length} token accounts(s) for mint ${my_mint_addres}`
  );

  console.log(accounts);
};

fetch_accounts();
