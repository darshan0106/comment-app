import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: 'Content must be a string.' })
  @IsNotEmpty({ message: 'Content cannot be empty.' })
  @MaxLength(1000, { message: 'Content cannot exceed 1000 characters.' })
  content: string;

  @IsOptional()
  @IsUUID('4', { message: 'Parent ID must be a valid UUID v4.' })
  parentId?: string;
}

export class UpdateCommentDto {
  @IsString({ message: 'Content must be a string.' })
  @IsNotEmpty({ message: 'Content cannot be empty.' })
  @MaxLength(1000, { message: 'Content cannot exceed 1000 characters.' })
  content: string;
}
