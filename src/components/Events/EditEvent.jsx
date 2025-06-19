import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEvent, updateEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx'

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({signal})=> fetchEvent({signal, id})
  })

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event
      await queryClient.cancelQueries({queryKey: ['events', id]})
      queryClient.setQueryData(['events', id], newEvent);
    },
  });

  function handleSubmit(formData) {
    mutate({
      id, event: formData
    })
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  return (
    <Modal onClose={handleClose}>
      {isError && (
        <>
          <ErrorBlock title={'Failed to edit'} message={error.info?.message || 'Please try again later'} />
          <Link to={'../'} className='button' />
        </>
      )}
      {isPending && (
        <LoadingIndicator />
      )}
      {!isError && !isPending && (
        <EventForm inputData={data} onSubmit={handleSubmit}>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </EventForm>
      )}
    </Modal>
  );
}
