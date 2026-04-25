export class BookingSlotTakenError extends Error {
  constructor() {
    super("Esse horário acabou de ser ocupado. Escolha outro.");
    this.name = "BookingSlotTakenError";
  }
}
