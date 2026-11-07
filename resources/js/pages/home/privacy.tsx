import { LegalPage } from './components/legal-page';
import { privacyDocument } from './utils/constants';

export default function Privacy() {
    return <LegalPage document={privacyDocument} />;
}
