import Button from "@ui/Button";

import { api } from "src/utils/api";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Todo() {
  const [inputTitle, setInputTitle] = useState<string>("");
  const [inputDescription, setInputDescription] = useState<string>("");
  const [inputPriority, setInputPriority] = useState<number>(0);
  const [inputDueDate, setInputDueDate] = useState<Date>(new Date());
  const [inputReminder, setInputReminder] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status == "unauthenticated") {
      void router.push("/");
    }
  }, [status, router]);

  const { data } = api.todo.getAllForLoggedUser.useQuery(undefined);

  const ctx = api.useContext();

  const { mutateAsync } = api.todo.create.useMutation({
    onSuccess: () => {
      void ctx.todo.getAllForLoggedUser.invalidate();
    },
  });

  async function handleCreateTodo() {
    await mutateAsync({
      title: inputTitle,
      description: inputDescription,
      priority: inputPriority,
      dueDate: inputDueDate,
      reminder: inputReminder,
    });
  }

  return (
    <div className="mt-40 flex table-auto border-separate border-spacing-2 place-content-center border border-slate-500">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Priority</th>
            <th>Due Date</th>
          </tr>
          {data &&
            data.map((todo) => (
              <TableRow
                key={todo.id}
                Title={todo.title}
                Description={todo.description ? todo.description : ""}
                Priority={todo.priority}
                DueDate={todo.dueDate ? todo.dueDate : null}
              />
            ))}
        </thead>
      </table>
      <Button onClick={() => void handleCreateTodo()}>Create Todo</Button>

      <label>Title</label>
      <input
        type="text"
        value={inputTitle}
        onChange={(e) => setInputTitle(e.target.value)}
      />
      <label>Description</label>
      <input
        placeholder="Description"
        type="text"
        value={inputDescription}
        onChange={(e) => setInputDescription(e.target.value)}
      />
      <label>Priority</label>
      <select
        value={inputPriority}
        onChange={(e) => setInputPriority(Number(e.target.value))}
      >
        <option value={0}>Low</option>
        <option value={1}>Medium</option>
        <option value={2}>High</option>
      </select>
      <label>Due Date</label>
      <input
        type="date"
        value={inputDueDate.toDateString()}
        onChange={(e) => setInputDueDate(new Date(e.target.value))}
      />
      <label>Reminder</label>
      <input
        type="checkbox"
        checked={inputReminder}
        onChange={(e) => setInputReminder(e.target.checked)}
      />
    </div>
  );
}

interface TodoTableProps {
  Title: string;
  Description: string;
  Priority: number | null;
  DueDate: Date | null;
}

function TableRow({ Title, Description, Priority, DueDate }: TodoTableProps) {
  let priority;
  switch (Priority) {
    case 0:
      priority = "Low";
      break;
    case 1:
      priority = "Medium";
      break;
    case 2:
      priority = "High";
      break;
    default:
      priority = "";
  }

  return (
    <tr>
      <td>{Title}</td>
      <td>{Description}</td>
      <td>{priority}</td>
      <td>{DueDate?.toDateString()}</td>
    </tr>
  );
}
