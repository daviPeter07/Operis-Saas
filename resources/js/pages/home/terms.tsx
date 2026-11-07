import { LegalPage } from './components/legal-page';
import { termsDocument } from './utils/constants';

export default function Terms() {
    return <LegalPage document={termsDocument} />;
}
