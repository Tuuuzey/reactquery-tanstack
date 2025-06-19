import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';

import Header from '../Header.jsx';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx'

export default function EventDetails() {

  const [ isDeleting, setIsDeleting ] = useState(false);

  const navigate = useNavigate()

  const { id } = useParams();
  const { data, isPending, isError, error } = useQuery({
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    queryKey: ['event', id],
  });

  const {mutate, isPending: isPendingDelete, isError: isErrorDelete, error: errorDelete} = useMutation({
    mutationFn: deleteEvent,
    onSuccess: ()=> {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      })
      navigate('/events');
    }
  }) 

  function handleStartDelete() {
    setIsDeleting(true)
  }

  function handleStopDelete() {
    setIsDeleting(false)
  }

  function handleDelete() {
    mutate({id: id});
  }
  
  if(isError) {
    <ErrorBlock title={'Failed to load event'} message={error.info?.message || 'Try again later'}/>
  }

  return (
    <>
    {isDeleting && (
      <Modal onClose={handleStopDelete}>
        <h2>Are you sure you want to delete this event?</h2>
        <div className='form-actions'>
        {isPendingDelete && <p>Deleting please wait...</p>}
        {!isPendingDelete && (
          <>
            <button onClick={handleDelete} className='button'>Delete</button>
            <button onClick={handleStopDelete} className='button-text'>Cancel</button>
          </>
        )}
        </div>
        {isErrorDelete && <ErrorBlock title={'Failed to delete event'} message={errorDelete.info?.message ||'Please try again later'}/>}
      </Modal>
    )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isPending && <p>Fetching event...</p>}
      {!isPending && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={handleStartDelete}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} {data.time}</time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
      </article>
      )}
    </>
  );
}
