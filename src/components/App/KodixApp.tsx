import { api } from "src/utils/api";
import { Button } from "@ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";

type Props = {
  id: string;
  appName: string;
  appDescription: string;
  appUrl: string;
  installed: boolean;
};

const KodixApp: React.FC<Props> = ({
  id,
  appName,
  appDescription,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  appUrl,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  installed = false,
}) => {
  const ctx = api.useContext();
  const { mutate } = api.workspace.installApp.useMutation({
    onSuccess: () => {
      void ctx.app.getAllWithInstalled.invalidate();
    },
  });

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{appName}</CardTitle>
        <CardDescription>{appDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Button onClick={() => mutate({ appId: id })}>Install</Button>
            </div>
            <div className="flex flex-col space-y-1.5"></div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default KodixApp;
