use num_traits::*;
use num_derive::*;
use std::mem;
use anchor_lang::prelude::*;

declare_id!("2QXMhVpni3MZ82bNNHp3Y7aBWZKk31M86RakY5mkASU5");

#[program]
pub mod tic_tac_toe {
    use super::*;
    pub fn setup_game(ctx: Context<SetupGame>, player_two: Pubkey) -> Result<()> {

        let game = &mut ctx.accounts.game;
        game.players = [ctx.accounts.player_one.key(), player_two];
        game.turn = 1;
        Ok(())
    }

    pub fn play(ctx: Context<Play>, tile: Tile) -> Result<()> {
        let game = &mut ctx.accounts.game;
        require!(
            game.current_player() == ctx.accounts.player.key(),
            TicTacToeError::NotPlayersTurn
        );
        game.play(&tile)
    }

}

#[error_code]
pub enum TicTacToeError {
    TileOutOfBounds,
    TileAlreadySet,
    GameAlreadyOver,
    NotPlayersTurn,
}

#[account]
pub struct Tile {
    row: u8,
    column: u8
}

#[account]
#[derive(Default)]
pub struct Game {
    players: [Pubkey; 2], // 64
    turn: u8, // 1
    board: [[Option<Sign>; 3]; 3], // 9 * (1+1) = 18
    state: GameState, // 32 + 1
}

impl Game {
    const MAXIMUM_SIZE: usize = mem::size_of::<Game>() + 9;

    pub fn is_active(&self) -> bool {
        self.state == GameState::Active
    }

    fn current_player_index(&self) -> usize {
        ((self.turn - 1) % 2) as usize
    }

    pub fn current_player(&self) -> Pubkey {
        self.players[self.current_player_index()]
    }

    fn is_winning_trio(&self, trio: [(usize, usize); 3]) -> bool {
        let [first, second, third] = trio;
        self.board[first.0][first.1].is_some() && 
        self.board[first.0][first.1] == self.board[second.0][second.1] && 
        self.board[first.0][first.1] == self.board[third.0][third.1]
    }

    pub fn update_state(&mut self) {
        for i in 0..=2 {
            if self.is_winning_trio([(i, 0), (i, 1), (i, 2)]) {
                self.state = GameState::Won {
                    winner: self.current_player()
                };
                return;
            }

            if self.is_winning_trio([(0, i), (1, i), (2, i)]) {
                self.state = GameState::Won {
                    winner: self.current_player()
                };
                return;
            }
        }

        if self.is_winning_trio([(0, 0), (1,1), (2,2)]) || self.is_winning_trio([(0,2), (1,1), (2,0)]) {
            self.state = GameState::Won {
                winner: self.current_player()
            };
            return;
        }

        for row in 0..=2 {
            for column in 0..=2 {
                if self.board[row][column].is_none() {
                    return;
                }
            }
        };

        self.state = GameState::Tie;

    }

    pub fn play(&mut self, tile: &Tile) -> Result<()> {
        if !self.is_active() {
            return Err(TicTacToeError::GameAlreadyOver.into());
        }

        match tile {
            tile @ Tile {
                row: 0..=2,
                column: 0..=2,
            } => match self.board[tile.row as usize][tile.column as usize] {
                Some(_) => return Err(TicTacToeError::TileAlreadySet.into()),
                None => {
                    self.board[tile.row as usize][tile.column as usize] = Some(Sign::from_usize(self.current_player_index()).unwrap());
                }
            },
            _ => return Err(TicTacToeError::TileOutOfBounds.into())
        };

        self.update_state();

        if let GameState::Active = self.state {
            self.turn += 1;
        }

        Ok(())
    }

}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameState {
    Active,
    Tie,
    Won {winner: Pubkey}
}

impl Default for GameState {
    fn default() -> Self {
        Self::Active
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, FromPrimitive, ToPrimitive, Copy, Clone, PartialEq, Eq)]
pub enum Sign {
    X,
    O
}

#[derive(Accounts)]
pub struct SetupGame<'info> {
    #[account(init, payer = player_one, space = Game::MAXIMUM_SIZE + 8)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub player_one: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Play<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    pub player: Signer<'info>
}
