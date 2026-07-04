import { BehaviorSubject, Observable } from 'rxjs';

export interface GameState {
  round: number; // 1 to 5
  availablePoints: number; // starts at 2
  fields: {
    money: number;
    family: number;
    friends: number;
  };
  health: number; // starts at 3
  gameOver: boolean;
  accidentModalOpen: boolean;
  gameOverModalOpen: boolean;
  history: Array<{
    round: number;
    money: number;
    family: number;
    friends: number;
  }>;
}

const INITIAL_STATE: GameState = {
  round: 1,
  availablePoints: 2,
  fields: {
    money: 1,
    family: 1,
    friends: 1,
  },
  health: 3,
  gameOver: false,
  accidentModalOpen: false,
  gameOverModalOpen: false,
  history: [
    { round: 1, money: 1, family: 1, friends: 1 }
  ]
};

export class GameService {
  private stateSubject = new BehaviorSubject<GameState>({
    ...INITIAL_STATE,
    fields: { ...INITIAL_STATE.fields },
    history: JSON.parse(JSON.stringify(INITIAL_STATE.history))
  });
  
  public state$: Observable<GameState> = this.stateSubject.asObservable();

  constructor() {}

  getState(): GameState {
    return this.stateSubject.getValue();
  }

  allocatePoint(field: 'money' | 'family' | 'friends'): void {
    const currentState = this.getState();
    if (currentState.gameOver || currentState.availablePoints <= 0) return;
    
    const currentFieldValue = currentState.fields[field];
    if (currentFieldValue >= 5) return; // Constraint: max 5 points per field

    // Update fields and available points for current action
    const updatedFields = {
      ...currentState.fields,
      [field]: currentFieldValue + 1
    };
    const updatedPoints = currentState.availablePoints - 1;

    let updatedRound = currentState.round;
    let updatedPointsForNextRound = updatedPoints;
    let updatedHealth = currentState.health;
    let updatedAccidentModalOpen = currentState.accidentModalOpen;
    let updatedGameOverModalOpen = currentState.gameOverModalOpen;
    let updatedGameOver = currentState.gameOver;
    const updatedHistory = JSON.parse(JSON.stringify(currentState.history));

    // Update current round's history element with live edits
    const roundIndex = updatedHistory.findIndex((h: any) => h.round === currentState.round);
    if (roundIndex >= 0) {
      updatedHistory[roundIndex] = {
        round: currentState.round,
        ...updatedFields
      };
    } else {
      updatedHistory.push({
        round: currentState.round,
        ...updatedFields
      });
    }

    // If current round's action points are spent
    if (updatedPoints === 0) {
      if (currentState.round === 2) {
        // Accident evaluation trigger: exactly after Round 2 ends, before Round 3 begins
        const hasReachedFive = updatedFields.money >= 5 || updatedFields.family >= 5 || updatedFields.friends >= 5;
        if (!hasReachedFive) {
          updatedHealth = Math.max(0, currentState.health - 2);
          updatedAccidentModalOpen = true;
        }
        // Advance round
        updatedRound = 3;
        updatedPointsForNextRound = 2;
        // Seed history for next round
        updatedHistory.push({ round: 3, ...updatedFields });
      } else if (currentState.round === 5) {
        // Round 5 points spent -> Game Over
        updatedGameOver = true;
        updatedGameOverModalOpen = true;
      } else {
        // Normal round transition
        updatedRound = currentState.round + 1;
        updatedPointsForNextRound = 2;
        // Seed history for next round
        updatedHistory.push({ round: updatedRound, ...updatedFields });
      }
    }

    this.stateSubject.next({
      ...currentState,
      round: updatedRound,
      availablePoints: updatedPointsForNextRound,
      fields: updatedFields,
      health: updatedHealth,
      gameOver: updatedGameOver,
      accidentModalOpen: updatedAccidentModalOpen,
      gameOverModalOpen: updatedGameOverModalOpen,
      history: updatedHistory
    });
  }

  closeAccidentModal(): void {
    const currentState = this.getState();
    this.stateSubject.next({
      ...currentState,
      accidentModalOpen: false
    });
  }

  closeGameOverModal(): void {
    const currentState = this.getState();
    this.stateSubject.next({
      ...currentState,
      gameOverModalOpen: false
    });
  }

  reset(): void {
    this.stateSubject.next({
      round: 1,
      availablePoints: 2,
      fields: {
        money: 1,
        family: 1,
        friends: 1,
      },
      health: 3,
      gameOver: false,
      accidentModalOpen: false,
      gameOverModalOpen: false,
      history: [
        { round: 1, money: 1, family: 1, friends: 1 }
      ]
    });
  }
}

// Export a singleton instance of the service
export const gameService = new GameService();
