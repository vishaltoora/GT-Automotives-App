export interface TireSizeDto {
  id: string;
  size: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTireSizeDto {
  size: string;
}

export interface UpdateTireSizeDto {
  size?: string;
}