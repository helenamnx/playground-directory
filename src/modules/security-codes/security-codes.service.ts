import { Injectable } from '@nestjs/common';
import { CreateSecurityCodeDto } from './dto/create-security-code.dto';
import { UpdateSecurityCodeDto } from './dto/update-security-code.dto';
import { CRUDService } from '@/config/database/CRUD/crud.service';
import { SecurityCode } from './schemas/security-code.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SecurityCodeStatus,
  SecurityCodeTypes,
} from '@/shared/enums/securityCode.enum';
import { BadRequestCustomResponse } from '@/shared/responses/error/custom-error-response';
import { CustomErrorKeys } from '@/shared/enums/error-keys.enum';
import { CustomErrorResponse } from '@/shared/responses/error/custom-error-response.class';
import { isDateExpired } from '@/shared/utils/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityCodesService extends CRUDService<SecurityCode> {
  private emailSendLimit: number;
  constructor(
    @InjectModel(SecurityCode.name)
    private securityCodeModel: Model<SecurityCode>,
    private readonly configService: ConfigService,
  ) {
    super(securityCodeModel);
    this.emailSendLimit = this.configService.get<number>(
      'app.SEND_EMAILS_LIMIT',
    );
  }

  async createSecurityCode(createSecurityCodeDto: CreateSecurityCodeDto) {
    try {
      const newSecurityCode = await super.create(createSecurityCodeDto);
      //TODO: Add History
      return newSecurityCode;
    } catch (error) {
      //TODO: Add History
      throw new BadRequestCustomResponse({
        title: 'Error  creating Security Code',
        key: CustomErrorKeys.ERROR_CREATING_REGISTERS,
        detail: 'There was an error creating the Security Code',
      });
    }
  }

  async findValidSecurityCode(userId: string, type: SecurityCodeTypes) {
    try {
      const securityCode = await super.findOne({
        filterOptions: {
          user: userId,
          type: type,
          status: SecurityCodeStatus.VALID,
        },
        triggerError: false,
      });
      if (securityCode) {
        return securityCode;
      }
      return null;
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }

  private checkIfSecurityCodeIsValid(
    securityCodeStatus: SecurityCodeStatus,
  ): boolean {
    try {
      return securityCodeStatus === SecurityCodeStatus.VALID ? true : false;
    } catch (error) {
      throw new BadRequestCustomResponse({
        title: 'Error checking security code status',
        detail: 'There was an error checking the security code status',
        key: CustomErrorKeys.ERROR_CHECKING_SECURITY_CODE_STATUS,
      });
    }
  }

  async checkSecurityCode(securityCodeid: string) {
    try {
      const securityCode = await super.findOne({
        filterOptions: { _id: securityCodeid },
        populateOptions: [{ path: 'user', populate: ['configuration'] }],
      });

      //Check if the security code is valid
      if (!this.checkIfSecurityCodeIsValid(securityCode.status)) {
        throw new BadRequestCustomResponse({
          title: 'Security Code not valid',
          detail: `Security code with id: ${securityCodeid} not valid `,
          key: CustomErrorKeys.SECURITY_CODE_NOT_VALID,
        });
      }
      //check if the security code is expired
      if (isDateExpired(securityCode.expireDate)) {
        await this.updateSecurityCodeStatus(
          securityCode,
          SecurityCodeStatus.EXPIRED,
        );
        throw new BadRequestCustomResponse({
          title: 'Security Code expired',
          detail: `Security code with id: ${securityCodeid} expired `,
          key: CustomErrorKeys.SECURITY_CODE_EXPIRED,
        });
      }

      return securityCode;
    } catch (error) {
      throw new BadRequestCustomResponse({
        title: 'Error checking security code',
        detail: 'There was an error checking the security code',
        key: CustomErrorKeys.ERROR_CHECKING_SECURITY_CODE,
      });
    }
  }

  async updateSecurityCodeStatus(
    securityCode: SecurityCode,
    nextSecurityCodeStatus: SecurityCodeStatus,
  ) {
    try {
      const updatedSecurityCode = await super.update(securityCode._id, {
        status: nextSecurityCodeStatus,
      });
      return updatedSecurityCode;
    } catch (error) {
      throw new BadRequestCustomResponse({
        title: 'Error updating security code status',
        detail: 'There was an error updating the security code status',
        key: CustomErrorKeys.ERROR_UPDATING_REGISTERS,
      });
    }
  }
  async updateSecurityCode(updateSecurityCodeDto: UpdateSecurityCodeDto) {
    const updatedSecurityCode = await super.update(
      updateSecurityCodeDto._id,
      updateSecurityCodeDto,
    );
    return updatedSecurityCode;
  }

  async findAll() {
    const securityCodes = await super.findAll({});
    return securityCodes;
  }

  async findSecurityCode(id: string) {
    const securityCode = await super.findOne({
      filterOptions: { _id: id },
    });
    return securityCode;
  }

  checkNumberOfEmailsSent(emailsSent: number) {
    try {
      if (
        //TODO: recoger de la configuración del cliente
        emailsSent >= this.emailSendLimit
      ) {
        throw new BadRequestCustomResponse({
          title: 'Too many emails sent',
          detail: 'You have sent too many emails, please try again later',
          key: CustomErrorKeys.TOO_MANY_EMAILS_SENT,
        });
      }
    } catch (error) {
      throw new CustomErrorResponse(error);
    }
  }
}
