import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "@/components/organisms/Header";
import ContactModal from "@/components/organisms/ContactModal";
import DealModal from "@/components/organisms/DealModal";
import TaskModal from "@/components/organisms/TaskModal";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { taskService } from "@/services/api/taskService";
import { activityService } from "@/services/api/activityService";
import { alertService } from "@/services/api/alertService";
const Layout = () => {
  const [modals, setModals] = useState({
    contact: { isOpen: false, data: null },
    deal: { isOpen: false, data: null },
    task: { isOpen: false, data: null },
  });

  const openModal = (type, data = null) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: true, data }
    }));
  };

  const closeModal = (type) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: false, data: null }
    }));
  };

  const handleSaveContact = async (contactData) => {
    const contact = modals.contact.data;
    
    if (contact) {
await contactService.update(contact.Id, contactData);
      await activityService.create({
        contact_id_c: contact.Id,
        deal_id_c: null,
        type_c: "note",
        description_c: `Contact updated: ${contactData.name_c || contactData.name}`,
        timestamp_c: new Date().toISOString(),
      });
    } else {
const newContact = await contactService.create(contactData);
      await activityService.create({
        contact_id_c: newContact.Id,
        deal_id_c: null,
        type_c: "note",
        description_c: `New contact added: ${contactData.name_c || contactData.name}`,
        timestamp_c: new Date().toISOString(),
      });
    }
  };

  const handleSaveDeal = async (dealData) => {
    const deal = modals.deal.data;
    
    if (deal) {
await dealService.update(deal.Id, dealData);
      await activityService.create({
        contact_id_c: parseInt(dealData.contact_id_c || dealData.contactId),
        deal_id_c: deal.Id,
        type_c: "deal",
        description_c: `Deal updated: ${dealData.title_c || dealData.title} - $${dealData.value_c || dealData.value}`,
        timestamp_c: new Date().toISOString(),
      });
    } else {
const newDeal = await dealService.create(dealData);
      await activityService.create({
        contact_id_c: parseInt(dealData.contact_id_c || dealData.contactId),
        deal_id_c: newDeal.Id,
        type_c: "deal",
        description_c: `New deal created: ${dealData.title_c || dealData.title} - $${dealData.value_c || dealData.value}`,
        timestamp_c: new Date().toISOString(),
      });
    }
  };

  const handleSaveTask = async (taskData) => {
    const task = modals.task.data;
    
    if (task) {
await taskService.update(task.Id, taskData);
      await activityService.create({
        contact_id_c: parseInt(taskData.contact_id_c || taskData.contactId),
        deal_id_c: null,
        type_c: "task",
        description_c: `Task updated: ${taskData.title_c || taskData.title}`,
        timestamp_c: new Date().toISOString(),
      });
    } else {
const newTask = await taskService.create(taskData);
      await activityService.create({
        contact_id_c: parseInt(taskData.contact_id_c || taskData.contactId),
        deal_id_c: null,
        type_c: "task",
        description_c: `New task created: ${taskData.title_c || taskData.title}`,
        timestamp_c: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAddContact={() => openModal("contact")}
        onAddDeal={() => openModal("deal")}
        onAddTask={() => openModal("task")}
      />
      
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modals */}
      <ContactModal
        isOpen={modals.contact.isOpen}
        onClose={() => closeModal("contact")}
        contact={modals.contact.data}
        onSave={handleSaveContact}
      />

      <DealModal
        isOpen={modals.deal.isOpen}
        onClose={() => closeModal("deal")}
        deal={modals.deal.data}
        onSave={handleSaveDeal}
      />

      <TaskModal
        isOpen={modals.task.isOpen}
        onClose={() => closeModal("task")}
        task={modals.task.data}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default Layout;