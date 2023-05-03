import { useRouter } from "next/router";
import { H1 } from "@ui/typography";

export default function Workspace() {
  const router = useRouter();
  const { workspaceName } = router.query;

  return <H1 className="p-4">Workspace: {workspaceName}</H1>;
}

export function getServerSideProps() {
  return {
    props: {
      workspaceName: "test",
    },
  };
}
