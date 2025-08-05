import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { EmailsService } from '../emails/emails.service';
import { PlatformTechnologies } from '@/shared/enums/platform-technologies.enum';
import { JsonFetcherService } from '@/shared/services/json-fetcher/json-fetcher.service';
import { PlatformsService } from '../platforms/platforms.service';
import { SecurityCode } from '../security-codes/schemas/security-code.schema';
import { AppUser } from '../app-users/schemas/app-user.schema';
import { User } from '../users/schemas/user.schema';
import { Client } from '../clients/schemas/client.schema';
import { CustomErrorResponse } from '@/shared/responses/error/custom-error-response.class';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { BadRequestCustomResponse } from '@/shared/responses/error/custom-error-response';
import { SendContactEmailDto } from './dto/send-contact-email.dto';
import { ContactPointsService } from '../contact-points/contact-points.service';
import { ClientsService } from '../clients/clients.service';
import { ContactPoint } from '../contact-points/schemas/contact-point.schema';
import { LanguagesEnum } from '@/shared/enums/languages.enum';
import { ConfigService } from '@nestjs/config';
import { NodeEnvEnum } from '@/shared/enums/node-env.enum';
import { AppUsersService } from '../app-users/app-users.service';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { SendLegalEmailDto } from './dto/send-legal-email.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly emailsService: EmailsService,
    private readonly contactPointsService: ContactPointsService,
    private readonly clientsService: ClientsService,
    private readonly platformsService: PlatformsService,
    private readonly jsonFetcherService: JsonFetcherService,
    private readonly configService: ConfigService,
    private readonly appUsersService: AppUsersService,
  ) {}
  create(createMessageDto: CreateMessageDto) {
    return 'This action adds a new message';
  }
  async sendResetPasswordMessage(
    user: User,
    securityCode: SecurityCode,
    client: Client,
  ) {
    try {
      const platform = await this.platformsService.getOwnPlatform();

      const emailsService = platform.services.find(
        (p) => p.technology === PlatformTechnologies.EMAIL,
      );

      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.resetPassword,
        variables: {
          securityCodeId: securityCode._id,
        },
        client: client,
      });

      //TODO: refactor && make object dynamic
      if (emailsService) {
        try {
          await this.emailsService.create({
            platform: emailsService,
            sender: platform.email,
            subject: 'Cambiar contraseña', //TODO: quitar string mágico
            emailType: 'reset-password', //TODO: quitar string mágico
            language: user.configuration.defaultLanguage,
            recipients: [
              {
                email: user.email,
                variables: {
                  url: `${endpoint}`,
                  baseUrl: client.baseURL,
                  privacyPoliciesUrl: `${client.baseURL}${
                    client.configuration.servicesEntrypoints.find(
                      (serviceEntrypoint) =>
                        serviceEntrypoint.action ===
                        actionEndpoints.privacyPolicies,
                    ).endpointPath
                  }`,
                },
              },
            ],
            bccRecipients: [],
            ccRecipients: [],
          });
        } catch (e) {
          //TODO: comprobar error
          throw new CustomErrorResponse(e);
        }
      }
    } catch (e) {
      console.log(e);
      throw new CustomErrorResponse(e);
    }
  }

  async sendPasswordUpdatedByAdmin(user: User, client: Client) {
    try {
      const platform = await this.platformsService.getOwnPlatform();

      const emailsService = platform.services.find(
        (p) => p.technology === PlatformTechnologies.EMAIL,
      );

      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      //TODO: refactor && make object dynamic
      if (emailsService) {
        try {
          await this.emailsService.create({
            platform: emailsService,
            sender: platform.email,
            subject: 'Contraseña actualizada por administrador', //TODO: quitar string mágico
            emailType: 'password-updated-by-admin', //TODO: quitar string mágico
            language: user.configuration.defaultLanguage || LanguagesEnum.ES,
            recipients: [
              {
                email: user.email,
                variables: {
                  baseUrl: client.baseURL,
                  privacyPoliciesUrl: `${client.baseURL}${
                    client.configuration.servicesEntrypoints.find(
                      (serviceEntrypoint) =>
                        serviceEntrypoint.action ===
                        actionEndpoints.privacyPolicies,
                    ).endpointPath
                  }`,
                },
              },
            ],
            bccRecipients: [],
            ccRecipients: [],
          });
        } catch (e) {
          //TODO: comprobar error
          throw new CustomErrorResponse(e);
        }
      }
    } catch (e) {
      console.log(e);
      throw new CustomErrorResponse(e);
    }
  }

  async sendUserActivatedMessage(appUser: AppUser, client: Client) {
    try {
      //get my own platform
      const platform = await this.platformsService.getOwnPlatform();

      //find the emails service
      const emailsService = platform.services.find(
        (p) => p.technology === PlatformTechnologies.EMAIL,
      );

      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      //  TODO: refactor && make object dynamic
      if (emailsService) {
        //send the email to the user
        try {
          await this.emailsService.create({
            platform: emailsService,
            sender: platform.email,
            subject: 'Usuario activado', //TODO: quitar string mágico
            emailType: 'user-activated', //TODO: quitar string mágico
            language:
              appUser.user?.configuration?.defaultLanguage || LanguagesEnum.ES,
            recipients: [
              {
                email: appUser.user.email,
                variables: {
                  baseUrl: client.baseURL,
                  privacyPoliciesUrl: `${client.baseURL}${
                    client.configuration.servicesEntrypoints.find(
                      (serviceEntrypoint) =>
                        serviceEntrypoint.action ===
                        actionEndpoints.privacyPolicies,
                    ).endpointPath
                  }`,
                },
              },
            ],
            bccRecipients: [],
            ccRecipients: [],
          });
        } catch (e) {
          console.log(e);
          throw new CustomErrorResponse(e);
        }
      }
    } catch (e) {
      console.log(e);
      throw new CustomErrorResponse(e);
    }
  }

  async sendVerifyEmailMessageAsAdmin(
    appUser: AppUser,
    client: Client,
    securityCode: SecurityCode,
  ) {
    try {
      //get my own platform
      const platform = await this.platformsService.getOwnPlatform();

      //find the emails service
      const emailsService = platform.services.find(
        (p) => p.technology === PlatformTechnologies.EMAIL,
      );

      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.resetPassword,
        variables: {
          securityCodeId: securityCode._id,
        },
        client: client,
      });
      //  TODO: refactor && make object dynamic
      if (emailsService) {
        //send the email to the user
        try {
          await this.emailsService.create({
            platform: emailsService,
            sender: platform.email,
            subject: 'Resetear contraseña', //TODO: quitar string mágico
            emailType: 'reset-password-by-admin', //TODO: quitar string mágico
            language:
              appUser.user?.configuration?.defaultLanguage || LanguagesEnum.ES,
            recipients: [
              {
                variables: {
                  url: `${endpoint}`,
                  securityCode: securityCode._id,
                  baseUrl: client.baseURL,
                  privacyPoliciesUrl: `${client.baseURL}${
                    client.configuration.servicesEntrypoints.find(
                      (serviceEntrypoint) =>
                        serviceEntrypoint.action ===
                        actionEndpoints.privacyPolicies,
                    ).endpointPath
                  }`,
                },
                email: appUser.user.email,
              },
            ],
            bccRecipients: [],
            ccRecipients: [],
          });
        } catch (e) {
          console.log(e);
          throw new CustomErrorResponse(e);
        }
      }
    } catch (e) {
      console.log(e);
      throw new CustomErrorResponse(e);
    }
  }

  sendUserRegistrationMessage() {
    //TODO: implement function
    console.log('Sending user registration email to admin...');
    console.log('Sending user registration notification to admin...');
  }

  async sendUserRegistrationApproved(
    appUser: AppUser,
    client: Client,
    securityCode: SecurityCode,
  ) {
    try {
      //get my own platform
      const platform = await this.platformsService.getOwnPlatform();

      //find the emails service
      const emailsService = platform.services.find(
        (p) => p.technology === PlatformTechnologies.EMAIL,
      );

      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      //construct the endpoint
      const endpoint = await this.platformsService.getCompletedEndpoint({
        action: actionEndpoints.resetPassword,
        variables: {
          securityCodeId: securityCode._id,
        },
        client: client,
      });
      //  TODO: refactor && make object dynamic
      if (emailsService) {
        //send the email to the user
        try {
          await this.emailsService.create({
            platform: emailsService,
            sender: platform.email,
            subject: 'Registro aprobado', //TODO: quitar string mágico
            emailType: 'registration-approved', //TODO: quitar string mágico
            language:
              appUser.user?.configuration?.defaultLanguage || LanguagesEnum.ES,
            recipients: [
              {
                variables: {
                  url: `${endpoint}`,
                  baseUrl: client.baseURL,
                  privacyPoliciesUrl: `${client.baseURL}${
                    client.configuration.servicesEntrypoints.find(
                      (serviceEntrypoint) =>
                        serviceEntrypoint.action ===
                        actionEndpoints.privacyPolicies,
                    ).endpointPath
                  }`,
                },
                email: appUser.user.email,
              },
            ],
            bccRecipients: [],
            ccRecipients: [],
          });
        } catch (e) {
          console.log(e);
          throw new CustomErrorResponse(e);
        }
      }
    } catch (e) {
      console.log(e);
      throw new CustomErrorResponse(e);
    }
  }

  async sendUserDeactivationMessage(
    appUser: AppUser,
    client: Client,
    observation: string,
  ) {
    try {
      //get my own platform
      const platform = await this.platformsService.getOwnPlatform();

      //find the emails service
      const emailsService = platform.services.find(
        (p) => p.technology === PlatformTechnologies.EMAIL,
      );

      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      //  TODO: refactor && make object dynamic
      if (emailsService) {
        //send the email to the user
        try {
          await this.emailsService.create({
            platform: emailsService,
            sender: platform.email,
            subject: 'Usuario desactivado', //TODO: quitar string mágico
            emailType: 'user-deactivated', //TODO: quitar string mágico
            language:
              appUser.user?.configuration?.defaultLanguage || LanguagesEnum.ES,
            recipients: [
              {
                variables: {
                  observations: observation,
                  baseUrl: client.baseURL,
                  privacyPoliciesUrl: `${client.baseURL}${
                    client.configuration.servicesEntrypoints.find(
                      (serviceEntrypoint) =>
                        serviceEntrypoint.action ===
                        actionEndpoints.privacyPolicies,
                    ).endpointPath
                  }`,
                },
                email: appUser.user.email,
              },
            ],
            bccRecipients: [],
            ccRecipients: [],
          });
        } catch (e) {
          console.log(e);
          throw new CustomErrorResponse(e);
        }
      }
    } catch (e) {
      console.log(e);
      throw new CustomErrorResponse(e);
    }
  }

  async sendDeniedRegistrationMessage(
    observation: string,
    client: Client,
    appUser: AppUser,
  ) {
    try {
      //get my own platform
      const platform = await this.platformsService.getOwnPlatform();

      //find the emails service
      const emailsService = platform.services.find(
        (p) => p.technology === PlatformTechnologies.EMAIL,
      );

      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      //  TODO: refactor && make object dynamic
      if (emailsService) {
        //send the email to the user
        try {
          await this.emailsService.create({
            platform: emailsService,
            sender: platform.email,
            subject: 'Registro rechazado', //TODO: quitar string mágico
            emailType: 'rejected-registration', //TODO: quitar string mágico
            language:
              appUser.user?.configuration?.defaultLanguage || LanguagesEnum.ES,
            recipients: [
              {
                variables: {
                  observations: observation,
                  baseUrl: client.baseURL,
                  privacyPoliciesUrl: `${client.baseURL}${
                    client.configuration.servicesEntrypoints.find(
                      (serviceEntrypoint) =>
                        serviceEntrypoint.action ===
                        actionEndpoints.privacyPolicies,
                    ).endpointPath
                  }`,
                },
                email: appUser.user.email,
              },
            ],
            bccRecipients: [],
            ccRecipients: [],
          });
        } catch (e) {
          console.log(e);
          throw new CustomErrorResponse(e);
        }
      }
    } catch (e) {
      console.log(e);
      throw new CustomErrorResponse(e);
    }
  }

  async sendPasswordUpdatedMessage(user: User, client: Client) {
    try {
      //get my own platform
      const platform = await this.platformsService.getOwnPlatform();

      //find the emails service
      const emailsService = platform.services.find(
        (p) => p.technology === PlatformTechnologies.EMAIL,
      );

      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      //  TODO: refactor && make object dynamic
      if (emailsService) {
        //send the email to the user
        try {
          await this.emailsService.create({
            platform: emailsService,
            sender: platform.email,
            subject: 'Contraseña actualizada correctamente', //TODO: quitar string mágico
            emailType: 'password-updated', //TODO: quitar string mágico
            language: user.configuration.defaultLanguage,
            recipients: [
              {
                email: user.email,
                baseUrl: client.baseURL,
                privacyPoliciesUrl: `${client.baseURL}${
                  client.configuration.servicesEntrypoints.find(
                    (serviceEntrypoint) =>
                      serviceEntrypoint.action ===
                      actionEndpoints.privacyPolicies,
                  ).endpointPath
                }`,
              },
            ],
            bccRecipients: [],
            ccRecipients: [],
          });
        } catch (e) {
          console.log(e);
          throw new CustomErrorResponse(e);
        }
      }
    } catch (e) {
      console.log(e);
      throw new CustomErrorResponse(e);
    }
  }

  /**
   * @description This function checks if the contact point exists and if the contact point belongs to the client.
   * @author Damian
   * @date 18/07/2025
   * @param {SendContactEmailDto} sendContactEmailDto
   * @param {Client} client
   * @returns {*}  {Promise<boolean>}
   * @memberof MessagesService
   */
  async checkSendContactEmail(
    sendContactEmailDto: SendContactEmailDto,
    client: Client,
  ): Promise<ContactPoint> {
    try {
      const {
        contactTo: contactPointId,
        isMember,
        memberNumber,
      } = sendContactEmailDto;

      //check if is member and member number is provided
      if (isMember) {
        if (!memberNumber) {
          throw new BadRequestCustomResponse({
            title: 'Member number is required',
            key: CustomErrorKeys.MISSING_MEMBER_NUMBER,
            detail: 'Member number is required',
          });
        } else {
          //check if the appUser with the provided member number exists
          const storedAppUser = await this.appUsersService.findOne({
            filterOptions: {
              memberNumber: memberNumber,
            },
            triggerError: false,
          });
          if (!storedAppUser) {
            throw new BadRequestCustomResponse({
              title: 'Member number does not exists',
              key: CustomErrorKeys.MEMBER_NUMBER_NOT_FOUND,
              detail: 'Member number does not exists',
            });
          }
        }
      }
      //check if the contact point exists
      const storedContactPoint = await this.contactPointsService.findOne({
        filterOptions: {
          _id: contactPointId,
        },
      });
      //then check if the contactPoint belongs to the client
      const storedClient = await this.clientsService.findOne({
        filterOptions: {
          _id: client._id,
        },
        populateOptions: [
          {
            path: 'contactPoints',
            select: ['-history', '-createdAt', '-updatedAt'],
          },
        ],
      });

      //check if the contact point belongs to the client
      if (
        !storedClient.contactPoints.some(
          (contactPoint) => contactPoint._id === contactPointId,
        )
      ) {
        throw new BadRequestCustomResponse({
          title: 'Contact point does not belong to the client',
          key: CustomErrorKeys.CONTACT_POINT_DOES_NOT_BELONG_TO_THE_CLIENT,
          detail: 'Contact point does not belong to the client',
        });
      }

      //check if the contact point is visible
      if (!storedContactPoint.isVisible) {
        throw new BadRequestCustomResponse({
          title: 'Contact point is not visible',
          key: CustomErrorKeys.CONTACT_POINT_IS_NOT_VISIBLE,
          detail: 'Contact point is not visible',
        });
      }
      return storedContactPoint;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * @description This function sends a contact email to the contact point.
   * It checks if the contact point exists and belongs to the client, then sends the email
   * @author Damian
   * @date 18/07/2025
   * @param {SendContactEmailDto} sendContactEmailDto
   * @param {Client} client
   * @memberof MessagesService
   */
  async sendContactEmail(
    sendContactEmailDto: SendContactEmailDto,
    client: Client,
  ): Promise<void> {
    try {
      const {
        memberNumber,
        isMember,
        contactMethod,
        subject,
        fullName,
        email,
        phone,
        reason,
      } = sendContactEmailDto;
      //check if the contact point exists and belongs to the client
      const storedContactPoint = await this.checkSendContactEmail(
        sendContactEmailDto,
        client,
      );
      //get the own platform
      const platform = await this.platformsService.getOwnPlatform();

      //get the emails service
      const emailsService = platform.services.find(
        (p) => p.technology === PlatformTechnologies.EMAIL,
      );
      const nodeEnv = this.configService.get<string>('NODE_ENV');

      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();

      //  TODO: refactor && make object dynamic
      if (emailsService) {
        //send the email to the user
        try {
          await this.emailsService.create({
            platform: emailsService,
            sender: platform.email,
            subject: 'Contacto', //TODO: quitar string mágico
            emailType: 'contact', //TODO: quitar string mágico
            language: LanguagesEnum.ES,
            recipients: [
              {
                email:
                  nodeEnv === NodeEnvEnum.DEVELOPMENT
                    ? 'mailtest@dev.mnxonline.com' //TODO: quitar string mágico
                    : storedContactPoint.value,
                variables: {
                  reason: reason,
                  phone: phone,
                  subject: subject,
                  isMember: isMember ? 'Sí' : 'No', //TODO: quitar string mágico,
                  memberNumber: isMember ? memberNumber : 'No es miembro',
                  contactMethod: contactMethod,
                  fullName: fullName,
                  email: email,
                  baseUrl: client.baseURL,
                  privacyPoliciesUrl: `${client.baseURL}${
                    client.configuration.servicesEntrypoints.find(
                      (serviceEntrypoint) =>
                        serviceEntrypoint.action ===
                        actionEndpoints.privacyPolicies,
                    ).endpointPath
                  }`,
                },
              },
            ],
            bccRecipients: [],
            ccRecipients: [],
          });
        } catch (e) {
          console.log(e);
          throw new CustomErrorResponse(e);
        }
      }
    } catch (e) {
      console.log(e);
      throw new CustomErrorResponse(e);
    }
  }

  /**
   * @description This function sends a legal contact email.
   * @author Damian
   * @date 22/07/2025
   * @param {{
   *     files?: Express.Multer.File[];
   *     dto: SendLegalEmailDto;
   *     appUser: AppUser;
   *   }} params
   * @memberof MessagesService
   */
  async sendLegalContactEmail(params: {
    files?: Express.Multer.File[];
    dto: SendLegalEmailDto;
    appUser: AppUser;
    client: Client;
  }) {
    try {
      const { files, dto, appUser, client } = params;
      const {
        fullName,
        email,
        phone,
        incidentDate,
        notificationDate,
        intendedPurpose,
        reason,
        contactPointName,
        dni,
        memberNumber,
      } = dto;
      //first, check if the user is socio
      this.checkIfUserIsSocio(appUser);
      //then, check if the memberNumber is provided, and belongs to the appUser
      if (appUser.memberNumber !== dto.memberNumber) {
        throw new BadRequestCustomResponse({
          title: 'Member number does not match',
          key: CustomErrorKeys.MEMBER_NUMBER_DOES_NOT_MATCH,
          detail: 'Member number does not match',
        });
      }
      //find the contactPoint of the legal contact point, or throw an error
      const contactPointJson = this.jsonFetcherService
        .fetchLegalContactPoints()
        .find((contactPoint) => contactPoint.name === contactPointName);
      if (!contactPointJson) {
        throw new BadRequestCustomResponse({
          title: 'Contact point not found',
          key: CustomErrorKeys.CONTACT_POINT_NOT_FOUND,
          detail: 'Contact point not found',
        });
      }
      const ccRecipients = contactPointJson.cc
        ? contactPointJson.cc.map((cc) => {
            return {
              email: cc,
            };
          })
        : [];
      //then, send find the email platform
      //get the own platform
      const platform = await this.platformsService.getOwnPlatform();

      //get the emails service
      const emailsService = platform.services.find(
        (p) => p.technology === PlatformTechnologies.EMAIL,
      );

      //get the actionEndpoints
      const actionEndpoints = this.jsonFetcherService.fetchEndpointActions();
      //send the email to the legal contact point with the cc recipients and files
      //  TODO: refactor && make object dynamic
      if (emailsService) {
        //send the email to the user
        try {
          await this.emailsService.create({
            platform: emailsService,
            sender: platform.email,
            subject: 'Contacto jurídico', //TODO: quitar string mágico
            emailType: 'legal-contact', //TODO: quitar string mágico
            language: LanguagesEnum.ES,
            attachments: files,
            recipients: [
              {
                email: contactPointJson.email,
                variables: {
                  reason: reason,
                  phone: phone,
                  dni: dni,
                  fullName: fullName,
                  incidentDate: incidentDate,
                  notificationDate: notificationDate,
                  intendedPurpose: intendedPurpose,
                  memberNumber: memberNumber,
                  // intendedDescription: intendedDescription,
                  email: email,
                  baseUrl: client.baseURL,
                  privacyPoliciesUrl: `${client.baseURL}${
                    client.configuration.servicesEntrypoints.find(
                      (serviceEntrypoint) =>
                        serviceEntrypoint.action ===
                        actionEndpoints.privacyPolicies,
                    ).endpointPath
                  }`,
                },
              },
            ],
            bccRecipients: [],
            ccRecipients: ccRecipients,
          });
        } catch (e) {
          console.log(e);
          throw new CustomErrorResponse(e);
        }
      }
    } catch (e) {
      console.log(e);
      throw new CustomErrorResponse(e);
    }
  }

  private checkIfUserIsSocio(appUser: AppUser) {
    const isSocio = appUser.user.roles.some(
      (role) => role.alias === RolesEnum.SOCIO,
    );
    if (!isSocio) {
      throw new BadRequestCustomResponse({
        title: 'User is not a socio',
        key: CustomErrorKeys.UNAUTHORIZED,
        detail: 'User is not a socio',
      });
    }
  }
}
