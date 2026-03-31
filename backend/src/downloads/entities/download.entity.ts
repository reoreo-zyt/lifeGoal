export interface Download {
  id: number;
  userId: number;
  bookId: string;
  bookTitle: string;
  format: string;
  createdAt: Date;
}
