import Link from 'next/link';
import { Button } from '../ui/button';
import { FaHotel } from 'react-icons/fa6';
// import { MdBedroomParent } from 'react-icons/md';

function Logo() {
  return (
    <Button size="icon" asChild className="bg-primary">
      <Link href="/">
        <FaHotel className="size-6" />
      </Link>
    </Button>
  );
}

export default Logo;
