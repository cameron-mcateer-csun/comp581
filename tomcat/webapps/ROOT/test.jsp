<%
import org.apache.activemq.transport.stomp.Stomp;
import org.apache.activemq.transport.stomp.StompConnection;
import org.apache.activemq.transport.stomp.StompFrame;
import org.apache.activemq.transport.stomp.Stomp.Headers.Subscribe;

/**
 *
 * This example demonstrates Stomp Java API
 *
 *
 *
 */
public class StompExample {

        public static void main(String args[]) throws Exception {
                StompConnection connection = new StompConnection();
                connection.open("localhost", 61613);

                connection.connect("system", "manager");

                connection.begin("tx1");
                connection.send("/queue/test", "message1");
                connection.send("/queue/test", "message2");
                connection.commit("tx1");

                connection.subscribe("/queue/test", Subscribe.AckModeValues.CLIENT);

                connection.begin("tx2");

                StompFrame message = connection.receive();
                System.out.println(message.getBody());
                connection.ack(message, "tx2");

                message = connection.receive();
                System.out.println(message.getBody());
                connection.ack(message, "tx2");

                connection.commit("tx2");

                connection.disconnect();
        }

}
%>