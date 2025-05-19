import Link from 'next/link';
import { Button } from '../ui/button';
import { MdBedroomParent } from 'react-icons/md';

function Logo() {
  return (
    <Button size="icon" asChild className="bg-primary">
      <Link href="/">
        <MdBedroomParent className="w-6 h-6 " />
      </Link>
    </Button>
  );
}

export default Logo;
