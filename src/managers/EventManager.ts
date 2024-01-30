import { EventEmitter } from "vscode";

/**
 * Represents an event manager for managing custom events in your extension.
 *
 * @typeparam TEvent - The event names (string) that this manager can handle.
 * @typeparam TPayload - The payload type that can be associated with each event.
 */
export interface TEventManagerEvent<TEvent extends string, TPayload = unknown> {
  eventName: TEvent; // The name of the event.
  payload?: TPayload; // (Optional) Payload associated with the event.
}

/**
 * An event manager for managing custom events within your extension.
 *
 * @typeparam TEvent - The event names (string) that this manager can handle.
 * @typeparam TPayload - The payload type that can be associated with each event.
 */
export class EventManager<TEvent extends string, TPayload = unknown> {
  private static _instance: EventManager<string, unknown> | null = null;

  private _onEvent = new EventEmitter<TEventManagerEvent<TEvent, TPayload>>();
  public listen = this._onEvent.event;

  /**
   * Creates a new instance of the EventManager.
   * (Note: Use the static `getInstance` method to get a singleton instance.)
   */
  private constructor() {
    // Private constructor to enforce the singleton pattern.
  }

  /**
   * Gets a singleton instance of the EventManager.
   *
   * @typeparam TEvent - The event names (string) that this manager can handle.
   * @typeparam TPayload - The payload type that can be associated with each event.
   * @returns A singleton instance of the EventManager.
   */
  public static getInstance<
    TEvent extends string,
    TPayload = unknown,
  >(): EventManager<TEvent, TPayload> {
    if (!EventManager._instance) {
      EventManager._instance = new EventManager<TEvent, TPayload>();
    }
    return EventManager._instance as EventManager<TEvent, TPayload>;
  }

  /**
   * Fires an event with the specified event name and optional payload.
   *
   * @param eventName - The name of the event to be fired.
   * @param payload - (Optional) The payload to be associated with the event.
   */
  public fire(eventName: TEvent, payload?: TPayload): void {
    this._onEvent.fire({ eventName, payload });
  }

  /**
   * Disposes of resources and subscriptions held by the EventManager.
   */
  public dispose() {
    this._onEvent.dispose();
  }
}
