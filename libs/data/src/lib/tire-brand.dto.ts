export interface TireBrandDto {
  id: string;
  name: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTireBrandDto {
  name: string;
  imageUrl?: string;
}

export interface UpdateTireBrandDto {
  name?: string;
  imageUrl?: string;
}