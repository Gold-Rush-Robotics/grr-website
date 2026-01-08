import { Typography } from "@/app/_components/typography";
import { Container } from "../_components/container";

export default function About() {
  return (
    <Container className="space-y-6">
      <Typography variant="h1">About</Typography>
      <Typography variant="p">
        Gold Rush Robotics is a robotics organization at the University of North
        Carolina at Charlotte. We consist of a diverse group of students,
        including multiple majors and backgrounds, all of whom share a passion
        for robotics. Our goal is to provide students with the opportunity to
        learn and grow through collaboration and a hands-on environment related
        to robotics. We cater to students at all levels of experience with
        robots.
      </Typography>
      <Typography variant="p">
        Our organization is unique in that we offer not only skill-building and
        hands-on training, but also competition and design programs. By
        participating in these programs, our members gain valuable technical and
        leadership skills that will benefit them in their future careers. We
        believe that the future of innovation lies in the hands of young and
        talented individuals, and by supporting Gold Rush Robotics, you can help
        us cultivate the next generation of STEM leaders.
      </Typography>
      <Typography variant="p">
        At Gold Rush Robotics, we are committed to giving back to the community
        and promoting STEM education in the younger generation. We have had the
        privilege of volunteering at local high school robotics competitions to
        give back to a community we owe everything to. In addition, we hosted a
        one-day high school sumo robot event, where we worked closely with
        students to teach them how to program and build LEGO Mindstorms robots.
        The event was a great success, with students demonstrating their
        creativity and technical skills in a friendly competition. Through these
        events, we hope to inspire and encourage young people to pursue their
        interest in robotics and engineering. We believe that by sharing our
        expertise and passion for robotics, we can help shape the future of STEM
        innovation and make a meaningful impact in the community.
      </Typography>
    </Container>
  );
}
