import { Document } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import config from 'src/config'
import { JwtToken } from 'src/types'

export interface UserDocument extends Document {
  isArchived: boolean;
  email: string;
  password: string;
  __confirmPassword: string;
  displayName: string;
  role: string;
  token: string;
  generateToken: () => void;
  clearToken: () => void;
  checkPassword: (password: string) => Promise<boolean>;
}

@Schema()
export class User {
  @Prop({
    type: Boolean,
    default: false,
  })
  isArchived: boolean

  @Prop({
    required: true,
    unique: true,
  })
  email: string

  @Prop({
    required: true,
  })
  password: string

  @Prop({
    required: true,
  })
  displayName: string

  @Prop({ required: true, enum: ['super-admin', 'admin', 'manager', 'stock-worker'] })
  role: string

  @Prop({
    required: true,
  })
  token: string
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.methods.checkPassword = function (this: UserDocument, password: string) {
  return bcrypt.compare(password, this.password)
}

UserSchema.methods.generateToken = function (this: UserDocument) {
  this.token = jwt.sign({ id: this._id } as JwtToken, config.jwt.secret)
}

UserSchema.methods.clearToken = function (this: UserDocument) {
  this.token = jwt.sign({ id: this._id } as JwtToken, config.jwt.secret, { expiresIn: '0s' })
}

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()

  const salt = await bcrypt.genSalt(config.saltWorkFactor)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

UserSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password
    return ret
  },
})





