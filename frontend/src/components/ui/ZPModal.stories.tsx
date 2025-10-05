'use client';

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ZPModal, useZPModal } from './ZPModal';
import { ZPButton } from './ZPButton';

const meta = {
  title: 'UI/ZPModal',
  component: ZPModal,
} satisfies Meta<typeof ZPModal>;

export default meta;
type Story = StoryObj<typeof meta>;

function ModalDemo() {
  const { isOpen, openModal, closeModal } = useZPModal(false);
  return (
    <div>
      <ZPButton variant='primary' onClick={openModal}>Open Modal</ZPButton>
      <ZPModal isOpen={isOpen} onClose={closeModal} title='Example Modal' description='Accessible modal example'>
        <ZPModal.Body>
          <p className='p-6'>This is a modal body.</p>
        </ZPModal.Body>
        <ZPModal.Footer>
          <ZPButton variant='outline' onClick={closeModal}>Close</ZPButton>
          <ZPButton variant='primary'>Confirm</ZPButton>
        </ZPModal.Footer>
      </ZPModal>
    </div>
  );
}

export const Basic: Story = {
  args: {
    isOpen: false,
    onClose: () => {},
    children: null,
  },
  render: () => <ModalDemo />,
};


