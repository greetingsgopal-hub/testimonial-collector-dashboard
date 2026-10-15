import React from 'react';
import BillingAndPlansPage, {
  PaymentMethodDetails,
  InvoiceItem,
} from '../../../pages/BillingAndPlansPage';
import { Workspace } from '../../../types';

export interface AccountBillingViewProps {
  workspace?: Workspace | null;
  onUpgrade?: () => void;
}

export type PaymentMethodDisplay = PaymentMethodDetails;
export type { InvoiceItem };

export const AccountBillingView: React.FC<AccountBillingViewProps> = (props) => {
  return <BillingAndPlansPage hideSidebar={true} {...props} />;
};

export default AccountBillingView;
