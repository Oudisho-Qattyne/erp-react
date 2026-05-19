import { useEffect } from "react";
import { useManageEmployee } from "../hooks/useEmployees";

export function EmployeeList() {
  const { employees, loading, error, getAll, remove } = useManageEmployee();

  useEffect(() => {
    getAll();
  }, [getAll]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {employees.map(emp => (
        <div key={emp.id}>
          {emp.first_name} {emp.last_name}
          <button onClick={() => remove(emp.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}