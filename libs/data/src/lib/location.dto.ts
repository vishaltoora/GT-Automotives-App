export interface LocationDto {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationDto {
  name: string;
}

export interface UpdateLocationDto {
  name?: string;
}