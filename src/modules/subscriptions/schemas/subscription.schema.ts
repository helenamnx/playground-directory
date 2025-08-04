import { User } from '@/modules/users/schemas/user.schema';
import { Thing } from '@/shared/schemas/thing.schema';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

/**
 *  Esquema de Suscripción para Notificaciones Push
 *
 * Esta colección almacena la información de suscripción de cada usuario
 * que ha aceptado recibir notificaciones push.
 */
@Schema()
export class Subscription extends Thing {
  /**
   * 🔹 Identificador único del usuario
   * - Permite asociar la suscripción a un usuario específico.
   */
  @Prop({ type: String, required: true, ref: 'AppUser' })
  owner: User;

  /**
   * 🔹 Endpoint de la suscripción push
   * - URL única proporcionada por el navegador, utilizada para enviar notificaciones.
   * - Cada suscripción tiene su propio `endpoint` único.
   */
  @Prop({ required: true })
  endpoint: string;

  /**
   * 🔹 Claves de autenticación de la suscripción
   * - `auth`: Clave de autenticación de la suscripción.
   * - `p256dh`: Clave pública utilizada en la encriptación de los mensajes.
   */
  @Prop({
    required: true,
    type: {
      auth: String,
      p256dh: String,
    },
  })
  keys: {
    auth: string;
    p256dh: string;
  };
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
