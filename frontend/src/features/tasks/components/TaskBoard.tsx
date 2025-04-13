import { DndContext, DragOverlay, rectIntersection } from '@dnd-kit/core'
import { onDragEnd } from '../hooks/onDragEnd.ts'
import { useTaskBoard } from '../hooks/useTaskBoard.ts'
import TaskLine from './TaskLine.tsx'
import TaskForm from './TaskForm.tsx'
import UserList from './UserList'
import Modal from '@/components/Modal/Modal.tsx'
import Loader from '@/components/Loader/Loader.tsx'
import { X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input'
import TaskCard from './TaskCard.tsx'

const TaskBoard = () => {

  const {
    todoItems,
    doneItems,
    inProgressItems,
    setDoneItems,
    setTodoItems,
    setInProgressItems,
    searchQuery,
    users,
    draggingTask,
    selectFetchUser,
    clearAllFilters,
    clearSearch,
    filterTasks,
    setSearchQuery,
    inputRef,
    selectedUser,
    setSelectedUser,
    sensors,
    handleOpen,
    open,
    loading,
    handleClose,
    dispatch,
  } = useTaskBoard()

  return (<>
    <Modal handleClose={handleClose} open={open}>
      <TaskForm onSuccess={handleClose} />
    </Modal>
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragEnd={e =>
        onDragEnd({
          e,
          todoItems: filterTasks(todoItems),
          setTodoItems,
          doneItems: filterTasks(doneItems),
          setDoneItems,
          inProgressItems: filterTasks(inProgressItems),
          setInProgressItems,
          dispatch,
        })}
    >
      {selectFetchUser || loading ? (
        <Loader/>
      ) : (
        <div className="flex flex-col p-2 justify-between min-w-[950px] overflow-hidden">
          <div className="flex items-center space-x-1 w-full ml-5 mt-2.5 mb-0">
            <div className="relative inline-block max-w-[300px] min-w-[230px]">
              <div className="relative w-full max-w-sm">
                <Input
                  type="text"
                  placeholder="Поиск по содержанию"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  ref={inputRef}
                  className="pr-10"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  {searchQuery ? (
                    <Button variant="ghost" size="icon" onClick={clearSearch}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  ) : (
                    <Search className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            {users ? <UserList
              users={users}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
            /> : null}
            <div className="flex flex-row items-center max-w-[700px] pr-5 mb-0 flex-grow">
              <div className="mx-3">
                <Button variant="outline" onClick={clearAllFilters}>Сбросить фильтры</Button>
              </div>
              <div className="ml-auto">
                <Button variant="outline" onClick={handleOpen}>Добавить задачу</Button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="w-1/3">
              <TaskLine selectedUser={selectedUser} title="к выполнению" items={filterTasks(todoItems)} />
            </div>
            <div className="w-1/3">
              <TaskLine selectedUser={selectedUser} title="в работе" items={filterTasks(inProgressItems)} />
            </div>
            <div className="w-1/3">
              <TaskLine selectedUser={selectedUser} title="готово" items={filterTasks(doneItems)} />
            </div>
          </div>
        </div>
      )}
      {draggingTask ? (
        <DragOverlay>
          <TaskCard task={draggingTask}  selectedUser={selectedUser} />
        </DragOverlay>
      ) : null}
    </DndContext>
  </>
  )
}

export default TaskBoard
