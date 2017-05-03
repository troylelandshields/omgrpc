package main

import (
	"errors"
	"fmt"
	"net"
	"os"
	"time"

	"github.com/weave-lab/wlib/uuid"

	"golang.org/x/net/context"

	"encoding/json"

	"google.golang.org/grpc"
)

func main() {
	svc := &Svc{}

	lis, err := net.Listen("tcp", "localhost:9000")
	if err != nil {
		fmt.Println("Unexpected err:", err)
		os.Exit(1)
	}

	srv := grpc.NewServer()

	RegisterExampleServiceServer(srv, svc)

	fmt.Println("Serving example grpc service:", lis.Addr().String())
	srv.Serve(lis)

}

var _ ExampleServiceServer = &Svc{}

type Svc struct {
}

//SayHello says the requested phrase
func (svc *Svc) SayHello(ctx context.Context, req *SayRequest) (*SayReply, error) {

	if req.SayWhat == "" {
		return nil, errors.New("Must request server to say something!")
	}

	if req.Recipient != nil {
		for i := 0; i < int(req.Recipient.NumberOfTimes); i++ {
			fmt.Printf("%s to %s - %d\n", req.SayWhat, req.Recipient.Name, i)
		}

		return &SayReply{
			SaidWhat: fmt.Sprintf("Server says, \"%s\" to %s, %d times at %s", req.SayWhat, req.Recipient.Name, req.Recipient.NumberOfTimes, time.Now().Format("3:04:05PM")),
		}, nil
	}

	fmt.Printf("%s to World\n", req.SayWhat)

	return &SayReply{
		SaidWhat: fmt.Sprintf("Server says, \"%s\" to World at %s", req.SayWhat, time.Now().Format("3:04:05PM")),
	}, nil
}

func (svc *Svc) SayHelloStream(srv ExampleService_SayHelloStreamServer) error {
	ctx := srv.Context()

	for {
		req, err := srv.Recv()
		if err != nil {
			return err
		}

		resp, err := svc.SayHello(ctx, req)
		if err != nil {
			return err
		}

		err = srv.Send(resp)
		if err != nil {
			return err
		}
	}
}

// Bytes takes bytes and returns bytes
func (svc *Svc) Bytes(ctx context.Context, req *MessageWithBytes) (*MessageWithBytes, error) {
	fmt.Printf("bytes came in %s\n", string(req.Bytes))

	if len(req.Bytes) == 16 {
		id, err := uuid.New(req.Bytes)
		if err == nil {
			fmt.Printf("it is a UUID: %s\n", id.String())
			return &MessageWithBytes{
				Bytes: id.Bytes(),
			}, nil
		}
	}

	var x interface{}
	err := json.Unmarshal(req.Bytes, &x)
	if err == nil {
		fmt.Printf("it is JSON: %+v\n", x)
		return &MessageWithBytes{
			Bytes: req.Bytes,
		}, nil
	}

	fmt.Printf("bytes are not a UUID, not JSON: %s\n", string(req.Bytes))
	return &MessageWithBytes{
		Bytes: req.Bytes,
	}, nil
}

//go:generate protoc -I=./ -I=$GOPATH/src --go_out=plugins=grpc:. example.proto
