import { Document, HydratedDocument, Model } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import config from 'src/config'
import { JwtToken } from 'src/types'
import { Task } from './task.schema'

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

const UserSchema = SchemaFactory.createForClass(User)

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

export const UserSchemaFactory = (taskModel: Model<Task>) => {
  const cascadeArchive = async (user: HydratedDocument<User>) => {
    const tasks = await taskModel.find({ user: user._id })

    await Promise.all(tasks.map(x => x.updateOne({ isArchived: true })))
  }

  const cascadeDelete = async (user: HydratedDocument<User>) => {
    const tasks = await taskModel.find({ user: user._id })

    await Promise.all(tasks.map(x => x.deleteOne()))
  }

  UserSchema.post('findOneAndUpdate', async function () {
    const user = await this.model.findOne<HydratedDocument<User>>(this.getQuery())

    if (!user) return

    const update = this.getUpdate()

    if (update && '$set' in update && update['$set'] && 'isArchived' in update['$set'] && update['$set'].isArchived) {
      await cascadeArchive(user)
    }
  })

  UserSchema.post('updateOne', async function () {
    const user = await this.model.findOne<HydratedDocument<User>>(this.getQuery())

    if (!user) return

    const update = this.getUpdate()

    if (update && '$set' in update && update['$set'] && 'isArchived' in update['$set'] && update['$set'].isArchived) {
      await cascadeArchive(user)
    }
  })

  UserSchema.post('save', async function () {
    if (this.isModified('isArchived') && this.isArchived) {
      await cascadeArchive(this)
    }
  })

  UserSchema.post('findOneAndDelete', async function () {
    const user = await this.model.findOne<HydratedDocument<User>>(this.getQuery())

    if (!user) return

    await cascadeDelete(user)
  })

  UserSchema.post('deleteOne', async function () {
    const user = await this.model.findOne<HydratedDocument<User>>(this.getQuery())

    if (!user) return

    await cascadeDelete(user)
  })

  return UserSchema
}