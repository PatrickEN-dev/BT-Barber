export class OutOfStockError extends Error {
  constructor(public readonly productName: string) {
    super(`Estoque insuficiente para "${productName}".`);
    this.name = "OutOfStockError";
  }
}

export class EmptyCartError extends Error {
  constructor() {
    super("O carrinho está vazio.");
    this.name = "EmptyCartError";
  }
}

export class OrderNotCancellableError extends Error {
  constructor() {
    super("Esse pedido não pode mais ser cancelado.");
    this.name = "OrderNotCancellableError";
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Não autorizado.");
    this.name = "UnauthorizedError";
  }
}
